export async function calculateCheckout(db:any, rawItems:any[], couponCode:string, codFee=0){
  const ids=rawItems.map((i:any)=>String(i.id||'')).filter(Boolean);
  if(!ids.length) throw new Error('Your bag is empty.');
  const variantIds=rawItems.map((i:any)=>String(i.variantId||'')).filter(Boolean);
  const [{data:products,error:productError},{data:settings,error:settingsError},{data:inventory,error:inventoryError},{data:variants,error:variantError}]=await Promise.all([
    db.from('products').select('id,name,price,image_url').in('id',ids).eq('active',true),
    db.from('store_settings').select('shipping_fee,free_shipping_threshold,platform_fee,gst_rate').eq('id',true).single(),
    db.from('product_inventory').select('product_id,stock_qty,reserved_qty,track_inventory').in('product_id',ids),
    variantIds.length?db.from('product_variants').select('id,product_id,stock_qty,reserved_qty,track_inventory').in('id',variantIds):Promise.resolve({data:[],error:null})
  ]);
  if(productError||!products?.length) throw new Error('One or more products are no longer available.');
  if(settingsError||!settings) throw new Error('Checkout charges are not configured.');
  if(inventoryError||variantError) throw new Error('Inventory could not be verified. Please try again.');
  const inventoryByProduct=new Map((inventory||[]).map((x:any)=>[String(x.product_id),x]));
  const inventoryByVariant=new Map((variants||[]).map((x:any)=>[String(x.id),x]));
  const safeItems=rawItems.map((i:any)=>{
    const product=products.find((p:any)=>String(p.id)===String(i.id));
    const size=String(i.size||'').toUpperCase();
    const quantity=Math.max(1,Math.min(20,Number(i.quantity)||1));
    const variantId=String(i.variantId||'');
    const stockRecord=variantId?inventoryByVariant.get(variantId):inventoryByProduct.get(String(i.id));
    if(stockRecord?.track_inventory){
      const available=Math.max(0,Number(stockRecord.stock_qty||0)-Number(stockRecord.reserved_qty||0));
      if(quantity>available) throw new Error(`${product?.name||'This item'} is only available in ${available} ${available===1?'unit':'units'}. Please update your bag.`);
    }
    return product&&['XS','S','M','L','XL','XXL','3XL'].includes(size)
      ? {id:String(product.id),name:String(product.name).slice(0,200),price:Number(product.price),quantity,size,variantId:variantId||undefined}
      : null;
  }).filter(Boolean);
  if(safeItems.length!==rawItems.length) throw new Error('Please choose a valid size for every product in your bag.');
  const subtotal=Math.round(safeItems.reduce((sum:number,i:any)=>sum+i.price*i.quantity,0)*100)/100;
  let discountAmount=0;
  if(couponCode){
    const {data:coupon,error:couponError}=await db.from('coupons').select('*').eq('code',couponCode).eq('active',true).maybeSingle();
    if(couponError||!coupon) throw new Error('Invalid or inactive coupon code.');
    const now=Date.now();
    if(coupon.starts_at&&new Date(coupon.starts_at).getTime()>now) throw new Error('This coupon is not active yet.');
    if(coupon.expires_at&&new Date(coupon.expires_at).getTime()<now) throw new Error('This coupon has expired.');
    if(coupon.usage_limit!=null&&Number(coupon.used_count)>=Number(coupon.usage_limit)) throw new Error('This coupon has reached its usage limit.');
    if(subtotal<Number(coupon.minimum_order_value||0)) throw new Error('This coupon requires a higher order value.');
    discountAmount=coupon.discount_type==='fixed'?Number(coupon.discount_value):subtotal*Number(coupon.discount_value)/100;
    if(coupon.maximum_discount!=null) discountAmount=Math.min(discountAmount,Number(coupon.maximum_discount));
    discountAmount=Math.min(discountAmount,subtotal);
    discountAmount=Math.round(discountAmount*100)/100;
  }
  const discountedSubtotal=Math.max(0,Math.round((subtotal-discountAmount)*100)/100);
  const shippingFee=discountedSubtotal>=Number(settings.free_shipping_threshold)?0:Number(settings.shipping_fee);
  const platformFee=Number(settings.platform_fee);
  const appliedCodFee=Math.max(0,Number(codFee)||0);
  const gstRate=Number(settings.gst_rate);
  const taxable=Math.round((discountedSubtotal+shippingFee+platformFee+appliedCodFee)*100)/100;
  const gstAmount=Math.round(taxable*gstRate)/100;
  const totalAmount=Math.round((taxable+gstAmount)*100)/100;
  if(!Number.isFinite(totalAmount)||totalAmount<=0) throw new Error('Invalid order amount.');
  return {safeItems,subtotal,discountAmount,couponCode,shippingFee,platformFee,codFee:appliedCodFee,gstRate,gstAmount,totalAmount};
}

export async function calculateCheckout(db:any, rawItems:any[], couponCode:string, codFee=0){
  const ids=rawItems.map((i:any)=>String(i.id||'')).filter(Boolean);
  if(!ids.length) throw new Error('Your bag is empty.');
  const [{data:products,error:productError},{data:settings,error:settingsError}]=await Promise.all([
    db.from('products').select('id,name,price,image_url').in('id',ids).eq('active',true),
    db.from('store_settings').select('shipping_fee,free_shipping_threshold,platform_fee,gst_rate').eq('id',true).single()
  ]);
  if(productError||!products?.length) throw new Error('One or more products are no longer available.');
  if(settingsError||!settings) throw new Error('Checkout charges are not configured.');
  const safeItems=rawItems.map((i:any)=>{
    const product=products.find((p:any)=>String(p.id)===String(i.id));
    const size=String(i.size||'').toUpperCase();
    return product&&['XS','S','M','L','XL','XXL','3XL'].includes(size)
      ? {id:String(product.id),name:String(product.name).slice(0,200),price:Number(product.price),quantity:Math.max(1,Math.min(20,Number(i.quantity)||1)),size}
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

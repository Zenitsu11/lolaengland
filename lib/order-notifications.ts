import { getSupabaseAdmin } from '@/lib/supabase-admin';

export type OrderNotificationType='order_confirmation'|'shipment'|'delivery'|'return'|'refund';

export async function enqueueOrderNotification(args:{orderId:string;type:OrderNotificationType;email?:string|null;phone?:string|null;}){
 const db=getSupabaseAdmin();
 if(!db) return {ok:false,error:'Database unavailable.'};
 const channels:string[]=[];
 if(args.email) channels.push('email');
 if(args.phone) channels.push('sms');
 if(!channels.length) return {ok:false,error:'No customer contact channel available.'};
 const rows=channels.map(channel=>({order_id:args.orderId,notification_type:args.type,channel,status:'pending',customer_email:args.email||null,customer_phone:args.phone||null}));
 const {error}=await db.from('order_notifications').upsert(rows,{onConflict:'order_id,notification_type,channel',ignoreDuplicates:true});
 if(error){console.error('notification enqueue failed',error);return {ok:false,error:'Could not queue notification.'};}
 return {ok:true};
}

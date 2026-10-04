'use client';
import type { ReactNode } from 'react';
import {createContext,useContext,useEffect,useMemo,useState} from 'react';
export type CartItem={id:string|number,name:string,price:number,image:string,quantity:number,size:string,color?:string,variantId?:string,lineId:string};
type CartContext={items:CartItem[],total:number,add:(item:Omit<CartItem,'quantity'>)=>void,remove:(lineId:string)=>void,setQuantity:(lineId:string,quantity:number)=>void,clear:()=>void};
const C=createContext<CartContext|null>(null);
const SESSION_KEY='lola-cart-session';
function getSession(){try{let id=localStorage.getItem(SESSION_KEY);if(!id){id=crypto.randomUUID();localStorage.setItem(SESSION_KEY,id)}return id}catch{return `guest-${Date.now()}`}}
export function CartProvider({children}:{children:ReactNode}){
 const [items,setItems]=useState<CartItem[]>([]);
 const [sessionId,setSessionId]=useState('');
 useEffect(()=>{try{const x=localStorage.getItem('lola-cart');if(x){const parsed=JSON.parse(x);setItems(Array.isArray(parsed)?parsed.map((i:any)=>({...i,size:i.size||'M',lineId:i.lineId||`${i.id}-${i.size||'M'}-${i.color||''}`})):[]);}setSessionId(getSession())}catch{}},[]);
 useEffect(()=>{try{localStorage.setItem('lola-cart',JSON.stringify(items));if(sessionId&&items.length){fetch('/api/cart/abandoned',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_id:sessionId,cart_data:items,subtotal:items.reduce((s,i)=>s+i.price*i.quantity,0)})}).catch(()=>{})}}catch{}},[items,sessionId]);
 const value=useMemo(()=>({items,total:items.reduce((s,i)=>s+i.price*i.quantity,0),add:(item:Omit<CartItem,'quantity'>)=>setItems(x=>{const f=x.find(i=>i.lineId===item.lineId);return f?x.map(i=>i.lineId===item.lineId?{...i,quantity:Math.min(20,i.quantity+1)}:i):[...x,{...item,quantity:1}]}),remove:(lineId:string)=>setItems(x=>x.filter(i=>i.lineId!==lineId),),setQuantity:(lineId:string,quantity:number)=>setItems(x=>x.map(i=>i.lineId===lineId?{...i,quantity:Math.max(1,Math.min(20,quantity))}:i)),clear:()=>setItems([])}),[items]);
 return <C.Provider value={value}>{children}</C.Provider>;
}
export function useCart(){const c=useContext(C);if(!c)throw new Error('useCart must be used inside CartProvider');return c;}

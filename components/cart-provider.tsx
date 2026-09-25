'use client';
import {createContext,useContext,useEffect,useMemo,useState} from 'react';
export type CartItem={id:string|number,name:string,price:number,image:string,quantity:number,size:string,lineId:string};
type CartContext={items:CartItem[],total:number,add:(item:Omit<CartItem,'quantity'>)=>void,remove:(lineId:string)=>void,setQuantity:(lineId:string,quantity:number)=>void,clear:()=>void};
const C=createContext<CartContext|null>(null);
export function CartProvider({children}:{children:React.ReactNode}){
 const [items,setItems]=useState<CartItem[]>([]);
 useEffect(()=>{try{const x=localStorage.getItem('lola-cart');if(x){const parsed=JSON.parse(x);setItems(Array.isArray(parsed)?parsed.map((i:any)=>({...i,size:i.size||'M',lineId:i.lineId||`${i.id}-${i.size||'M'}`})):[]);}}catch{}},[]);
 useEffect(()=>{try{localStorage.setItem('lola-cart',JSON.stringify(items));}catch{}},[items]);
 const value=useMemo(()=>({items,total:items.reduce((s,i)=>s+i.price*i.quantity,0),
 add:(item:Omit<CartItem,'quantity'>)=>setItems(x=>{const f=x.find(i=>i.lineId===item.lineId);return f?x.map(i=>i.lineId===item.lineId?{...i,quantity:Math.min(20,i.quantity+1)}:i):[...x,{...item,quantity:1}]}),
 remove:(lineId:string)=>setItems(x=>x.filter(i=>i.lineId!==lineId)),
 setQuantity:(lineId:string,quantity:number)=>setItems(x=>x.map(i=>i.lineId===lineId?{...i,quantity:Math.max(1,Math.min(20,quantity))}:i)),
 clear:()=>setItems([])}),[items]);
 return <C.Provider value={value}>{children}</C.Provider>;
}
export function useCart(){const c=useContext(C);if(!c)throw new Error('useCart must be used inside CartProvider');return c;}

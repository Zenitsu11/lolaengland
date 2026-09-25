'use client';
import {createContext,useContext,useEffect,useMemo,useState} from 'react';
type CartItem={id:string|number,name:string,price:number,image:string,quantity:number};
type CartContext={items:CartItem[],total:number,add:(item:Omit<CartItem,'quantity'>)=>void,remove:(id:string|number)=>void,setQuantity:(id:string|number,quantity:number)=>void,clear:()=>void};
const C=createContext<CartContext|null>(null);
export function CartProvider({children}:{children:React.ReactNode}){
 const [items,setItems]=useState<CartItem[]>([]);
 useEffect(()=>{try{const x=localStorage.getItem('lola-cart');if(x)setItems(JSON.parse(x));}catch{}},[]);
 useEffect(()=>{try{localStorage.setItem('lola-cart',JSON.stringify(items));}catch{}},[items]);
 const value=useMemo(()=>({items,total:items.reduce((s,i)=>s+i.price*i.quantity,0),
 add:(item:Omit<CartItem,'quantity'>)=>setItems(x=>{const f=x.find(i=>String(i.id)===String(item.id));return f?x.map(i=>String(i.id)===String(item.id)?{...i,quantity:i.quantity+1}:i):[...x,{...item,quantity:1}]}),
 remove:(id:string|number)=>setItems(x=>x.filter(i=>String(i.id)!==String(id))),
 setQuantity:(id:string|number,quantity:number)=>setItems(x=>x.map(i=>String(i.id)===String(id)?{...i,quantity:Math.max(1,Math.min(20,quantity))}:i)),
 clear:()=>setItems([])}),[items]);
 return <C.Provider value={value}>{children}</C.Provider>;
}
export function useCart(){const c=useContext(C);if(!c)throw new Error('useCart must be used inside CartProvider');return c;}

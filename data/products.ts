import type { Product } from '@/components/product-card';

const amazon = 'https://www.amazon.in/roadster-Womens-Tops-T-Shirts-Shirts/s?k=roadster&rh=n%3A1968542031';
const flipkart = 'https://www.flipkart.com/womens-tshirts/oversized~fit/pr?sid=clo%2Cank%2Cloi';

export const products: Product[] = [
  {id:1,name:'Rose Oversized Graphic T-Shirt',price:399,mrp:799,rating:4.3,reviews:'1,200',tone:'#f0e2e5',amazon,flipkart,description:'Relaxed oversized fit with an easy graphic mood for everyday styling.'},
  {id:2,name:'Pink Heart Printed T-Shirt',price:449,mrp:899,rating:4.5,reviews:'850',tone:'#f0e2e5',amazon,flipkart,description:'Soft pink energy with a playful printed finish and relaxed silhouette.'},
  {id:3,name:'Cotton Daily Casual T-Shirt',price:329,mrp:699,rating:4.2,reviews:'640',tone:'#f0e2e5',amazon,flipkart,description:'An easy everyday cotton-style tee designed for repeat wear.'},
  {id:4,name:'Minimal Solid Oversized T-Shirt',price:379,mrp:749,rating:4.4,reviews:'970',tone:'#f0e2e5',amazon,flipkart,description:'Clean, minimal and oversized — the wardrobe staple that goes with everything.'},
];

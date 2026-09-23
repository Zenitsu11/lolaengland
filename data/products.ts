import type { Product } from '@/components/product-card';

const amazon = 'https://www.amazon.in/roadster-Womens-Tops-T-Shirts-Shirts/s?k=roadster&rh=n%3A1968542031';
const flipkart = 'https://www.flipkart.com/womens-tshirts/oversized~fit/pr?sid=clo%2Cank%2Cloi';

export const products: Product[] = [
  {id:1,name:'Give Me Space — Mint',price:599,mrp:899,rating:4.5,reviews:'850',tone:'#c8f3e8',amazon,flipkart,description:'Mint printed T-shirt with an astronaut graphic and relaxed everyday fit.'},
  {id:2,name:'Classic Mint',price:599,mrp:899,rating:4.4,reviews:'720',tone:'#c8f3e8',amazon,flipkart,description:'Clean mint regular-fit T-shirt for easy everyday styling.'},
  {id:3,name:'Give Me Space — Navy',price:599,mrp:899,rating:4.5,reviews:'910',tone:'#17264b',amazon,flipkart,description:'Navy printed T-shirt featuring the Give Me Space astronaut graphic.'},
  {id:4,name:'Classic Navy',price:599,mrp:899,rating:4.4,reviews:'760',tone:'#17264b',amazon,flipkart,description:'Classic navy regular-fit T-shirt designed for everyday wear.'},
  {id:5,name:'Discipline — Olive',price:599,mrp:899,rating:4.6,reviews:'680',tone:'#55701d',amazon,flipkart,description:'Olive oversized T-shirt with a bold Discipline Over Motivation graphic.'},
  {id:6,name:'Discipline Back Print',price:599,mrp:899,rating:4.6,reviews:'640',tone:'#55701d',amazon,flipkart,description:'Olive oversized T-shirt with a statement back print.'},
];

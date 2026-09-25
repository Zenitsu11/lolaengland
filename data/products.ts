import type { Product } from '@/components/product-card';

const amazon = 'https://www.amazon.in/roadster-Womens-Tops-T-Shirts-Shirts/s?k=roadster&rh=n%3A1968542031';
const flipkart = 'https://www.flipkart.com/womens-tshirts/oversized~fit/pr?sid=clo%2Cank%2Cloi';
const v = '?v=8';

export const products: Product[] = [
  {id:1,name:'Give Me Space — Mint (Back)',price:599,mrp:899,rating:4.5,reviews:'850',tone:'#c8f3e8',image_url:'/products/lola-mint-back.webp'+v,amazon,flipkart,description:'Mint T-shirt with a clean back view and relaxed everyday fit.'},
  {id:2,name:'Give Me Space — Mint',price:599,mrp:899,rating:4.5,reviews:'850',tone:'#c8f3e8',image_url:'/products/lola-mint-front.webp'+v,amazon,flipkart,description:'Mint printed T-shirt with an astronaut graphic and relaxed everyday fit.'},
  {id:3,name:'Give Me Space — Navy (Back)',price:599,mrp:899,rating:4.5,reviews:'910',tone:'#17264b',image_url:'/products/lola-navy-back.webp'+v,amazon,flipkart,description:'Navy T-shirt with a clean back view and classic regular fit.'},
  {id:4,name:'Give Me Space — Navy',price:599,mrp:899,rating:4.5,reviews:'910',tone:'#17264b',image_url:'/products/lola-navy-front.webp'+v,amazon,flipkart,description:'Navy printed T-shirt featuring the Give Me Space astronaut graphic.'},
  {id:5,name:'Discipline — Olive',price:599,mrp:899,rating:4.6,reviews:'680',tone:'#55701d',image_url:'/products/lola-olive-front.webp'+v,amazon,flipkart,description:'Olive oversized T-shirt with a bold Discipline Over Motivation graphic.'},
  {id:6,name:'Discipline — Olive (Back)',price:599,mrp:899,rating:4.6,reviews:'680',tone:'#55701d',image_url:'/products/lola-olive-back.webp'+v,amazon,flipkart,description:'Olive oversized T-shirt with a statement back print.'},
  {id:7,name:'Unleash The Beast — Brown',price:599,mrp:899,rating:4.6,reviews:'620',tone:'#3b251b',image_url:'/products/lola-brown-front.webp'+v,amazon,flipkart,description:'Brown relaxed-fit T-shirt with a clean minimal front.'},
  {id:8,name:'Unleash The Beast — Brown (Back)',price:599,mrp:899,rating:4.6,reviews:'620',tone:'#3b251b',image_url:'/products/lola-brown-back.webp'+v,amazon,flipkart,description:'Brown T-shirt with a bold Unleash The Beast back graphic.'},
  {id:9,name:'Purple Headphones — Black',price:599,mrp:899,rating:4.6,reviews:'540',tone:'#111111',image_url:'/products/lola-headphones-front.webp?v=2',amazon,flipkart,description:'Black T-shirt with a bold purple headphones graphic and relaxed everyday fit.'},
  {id:10,name:'Purple Headphones — Black (Back)',price:599,mrp:899,rating:4.6,reviews:'540',tone:'#111111',image_url:'/products/lola-headphones-back.webp?v=2',amazon,flipkart,description:'Black T-shirt with a clean back view and relaxed everyday fit.'},
  {id:11,name:'Olive Essential — Olive',price:599,mrp:899,rating:4.7,reviews:'210',tone:'#4b5d1b',image_url:'/products/lola-olive-essential-front.webp',amazon,flipkart,description:'Olive green regular-fit women’s T-shirt with a clean everyday look.'},
  {id:12,name:'Olive Essential — Olive (Back)',price:599,mrp:899,rating:4.7,reviews:'210',tone:'#4b5d1b',image_url:'/products/lola-olive-essential-back.webp',amazon,flipkart,description:'Olive green regular-fit women’s T-shirt, back view.'},
  {id:13,name:'Anime Power — White',price:599,mrp:899,rating:4.7,reviews:'195',tone:'#f4f4f4',image_url:'/products/lola-anime-white-front.webp',amazon,flipkart,description:'White women’s T-shirt with a bold anime-inspired back graphic.'},
  {id:14,name:'Anime Power — White (Back)',price:599,mrp:899,rating:4.7,reviews:'195',tone:'#f4f4f4',image_url:'/products/lola-anime-white-back.webp',amazon,flipkart,description:'White women’s T-shirt with a bold anime-inspired back graphic.'},
  {id:15,name:'Furious Dragon — Brown',price:599,mrp:899,rating:4.7,reviews:'180',tone:'#3b2418',image_url:'/products/lola-dragon-brown-front.webp',amazon,flipkart,description:'Brown graphic women’s T-shirt with a playful dragon design.'},
  {id:16,name:'Furious Dragon — Brown (Back)',price:599,mrp:899,rating:4.7,reviews:'180',tone:'#3b2418',image_url:'/products/lola-dragon-brown-back.webp',amazon,flipkart,description:'Brown graphic women’s T-shirt, clean back view.'},
  {id:17,name:'CAKAZA — Black',price:599,mrp:899,rating:4.7,reviews:'165',tone:'#111111',image_url:'/products/lola-cakaza-black-front.webp',amazon,flipkart,description:'Black oversized women’s T-shirt with a minimal CAKAZA front graphic.'},
  {id:18,name:'CAKAZA — Black (Back)',price:599,mrp:899,rating:4.7,reviews:'165',tone:'#111111',image_url:'/products/lola-cakaza-black-back.webp',amazon,flipkart,description:'Black oversized women’s T-shirt with a clean back.'},
  {id:19,name:'Dagger — Black',price:599,mrp:899,rating:4.7,reviews:'150',tone:'#111111',image_url:'/products/lola-dagger-black-front.webp',amazon,flipkart,description:'Black graphic women’s T-shirt with a detailed dagger motif.'},
  {id:20,name:'Dagger — Black (Back)',price:599,mrp:899,rating:4.7,reviews:'150',tone:'#111111',image_url:'/products/lola-dagger-black-back.webp',amazon,flipkart,description:'Black graphic women’s T-shirt with a detailed back print.'},
];

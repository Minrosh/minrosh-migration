import fs from 'fs';

function applyBrandColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Hero Labels & Badges
  content = content.replace(/text-blue-700/g, 'text-brand-rose');
  content = content.replace(/bg-blue-100\/50/g, 'bg-brand-rose/10');
  content = content.replace(/text-indigo-600/g, 'text-brand-plum');
  content = content.replace(/bg-indigo-100\/70/g, 'bg-brand-rose/10');
  content = content.replace(/bg-indigo-100/g, 'bg-brand-rose/20');
  
  // Hero Typography
  content = content.replace(/bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-600/g, 'bg-gradient-to-r from-brand-plum via-brand-rose to-brand-gold');
  
  // Primary CTA
  content = content.replace(/bg-blue-600/g, 'bg-brand-rose');
  content = content.replace(/shadow-blue-600\/30/g, 'shadow-brand-rose/20');
  content = content.replace(/shadow-blue-600\/50/g, 'shadow-brand-rose/40');
  content = content.replace(/hover:bg-blue-700/g, 'hover:bg-brand-plum');
  
  // Secondary CTA
  content = content.replace(/text-blue-900 border-blue-200/g, 'text-brand-plum border-brand-rose/30');

  // Icons and Highlights
  content = content.replace(/bg-blue-100/g, 'bg-brand-cream');
  content = content.replace(/text-blue-600/g, 'text-brand-rose');
  content = content.replace(/border-blue-400/g, 'border-brand-gold');
  content = content.replace(/from-blue-500 to-indigo-600/g, 'from-brand-plum to-brand-rose');
  content = content.replace(/from-blue-500 before:via-indigo-300/g, 'from-brand-plum before:via-brand-rose');
  content = content.replace(/text-blue-500/g, 'text-brand-rose');
  content = content.replace(/border-blue-500/g, 'border-brand-gold');
  content = content.replace(/text-blue-300/g, 'text-brand-gold');
  
  // Backgrounds & Accents
  content = content.replace(/bg-blue-900\/10/g, 'bg-brand-plum/10');
  content = content.replace(/from-blue-200\/40 to-indigo-300\/40/g, 'from-brand-rose/20 to-brand-plum/10');
  content = content.replace(/hover:border-blue-200/g, 'hover:border-brand-gold/50');
  content = content.replace(/hover:border-blue-300/g, 'hover:border-brand-gold/50');
  content = content.replace(/hover:bg-blue-50/g, 'hover:bg-brand-cream');
  content = content.replace(/border-blue-100/g, 'border-brand-rose/20');
  content = content.replace(/bg-blue-50\/50/g, 'bg-brand-cream/50');
  
  // Hover color updates
  content = content.replace(/hover:text-blue-800/g, 'hover:text-brand-plum');
  content = content.replace(/group-hover:text-blue-900/g, 'group-hover:text-brand-plum');
  content = content.replace(/group-hover:text-blue-800/g, 'group-hover:text-brand-plum');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated colors in ${filePath}`);
}

applyBrandColors('components/home/home-tab-server.jsx');
applyBrandColors('components/site-header-nav.jsx');

import { parseISO, format, addDays } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { isMobile } from 'react-device-detect';

/**
 * 
 * @param {number} currency 
 */
export function formatCurrency(currency) {
    currency = currency.toString();
    var v = currency.replace(/\D/g,'');
    v = (v/100).toFixed(2) + '';
    v = v.replace(".", ",");
    v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
    
    return v;
}

/**
 * 
 * @param {string} str 
 * @param {boolean} lower 
 */
export function capitalize(str, lower=false) {
    return (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
}

/**
 * 
 * @param {string} value 
 */
export function capitalizeFiristLetter(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * 
 * @param {number} value 
 */
export function currency(value) {
    return value.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
}

/**
 * 
 * @param {number} minutes 
 */
export function MinutesToHoursNotation(minutes) {
    return (Math.floor(minutes/60)+"h "+minutes%60+" min");
}

/**
 * 
 * @param {number} value 
 */
export function priceToFloat(value) {
  const fractional = value.split(",")[1];
  const price = value.split(",")[0];
  
  return(Number(`${price.split(".").join("")}.${fractional}`));
}

/**
 * 
 * @param {string} value 
 */
export function maskPhone(value) {
    // Máscara Telefone
    function mtel(v) {
        v = v.toString().replace(/^(\d{2})(\d)/g, '($1)$2'); //Coloca parênteses em volta dos dois primeiros dígitos
        v = v.toString().replace(/(\d)(\d{4})$/, '$1-$2'); //Coloca hífen entre o quarto e o quinto dígitos
        return v;
    }

    //Remove tudo o que não é dígito
    value = value.replace(/\D/g, '');
    return mtel(value);
}

/**
 * 
 * @param {string} endpoint_share 
 */
export function shareOnWhatsapp(endpoint_share) {
    const whatsapp_desktop = 'https://web.whatsapp.com/send?text=';
    const whatsapp_mobile = 'https://wa.me/?text=';

    window.open((isMobile ? whatsapp_mobile : whatsapp_desktop) + encodeURIComponent(
        `Acesse:: https://fretamento-piquiatuba.netlify.app${endpoint_share}`
    ), '_blank');
}

/**
 * 
 * @param {Array<Object>} arr 
 * @param {string} compare 
 */
export function findDuplicates(arr, compare) {
    let sorted_arr = arr.slice().sort();
    let results = [];
    for (let index = 0; index < sorted_arr.length - 1; index++) {
        if(sorted_arr[index+1][compare] === sorted_arr[index][compare]) {
            results.push(sorted_arr[index]);
        }
    }
    return results;
}

/**
 * 
 * @param {*} text 
 * @param {*} max_length 
 */
export function normalizeString(text, max_length=20) {
    let cut = text;
    if (text.length > max_length) {
      const __part = text.slice(0, max_length - 1);
      cut = `${__part.trim()}...`;
    }
  
    return cut;
}

/**
 * 
 * @param {string} date 
 * @param {string} date_format_type 
 */
export function getDatetime(date, date_format_type, add_days=0) {
    console.log({date});
    date = parseISO(date);

    if(add_days > 0) {
        date = addDays(date, add_days);
    }

    const formatted = format(date, date_format_type, {locale: ptBR});
    return formatted;
}

/**
 * 
 * @param {string} date_format_type 
 * @param {number} add_days 
 */
export function getCurrentDate(date_format_type, add_days=0) {
    let date = new Date();
  
    if(add_days > 0) {
      date = addDays(date, add_days);
    }
  
    const formatted = format(date, date_format_type, {locale: ptBR});
    return formatted;
}
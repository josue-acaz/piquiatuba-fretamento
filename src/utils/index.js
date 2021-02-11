import { parseISO, format, addMinutes, addDays } from "date-fns";
import { PDF_URL } from "../global";
import { ptBR } from 'date-fns/locale';
import { isMobile } from 'react-device-detect';

export function sleep(delay = 0) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}

export function event(name="", value, isCheck=false) {
    const obj = { target: { name } };
    if(isCheck) {
        obj.target.checked = value;
    } else {
        obj.target.value = value;
    }

    return(obj);
}

export function formatCurrency(currency) {
    currency = currency.toString();
    var v = currency.replace(/\D/g,'');
    v = (v/100).toFixed(2) + '';
    v = v.replace(".", ",");
    v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
    
    return v;
}

export function formatDatetime(datetime) { // 2018-04-01 16:00:00
const __datetime = parseISO(datetime);
return(format(__datetime, "dd 'de' MMMM', às ' HH:mm'h'", { locale: ptBR }));
}

// formata datas do tipo 2021-01-11T20:52:05.757Z para 2021-01-11 11:52:10
export function parseSqlToDatetime(date) {
    const arr = (new Date(date)).toLocaleString().split(' ');
    const formatted = `${arr[0].split('/').reverse().join('-')} ${arr[1]}`;

    return formatted;
}

export function capitalize(str, lower = false) {
    return (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
}

export function formatDate(datetime) {

function capitalizeFiristLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const __date = parseISO(datetime);
let formatted = format(__date, "iiii',' dd 'de' MMMM", { locale: ptBR });

let result = "";
if(formatted.includes("domingo") || formatted.includes("sábado")) {
    const arr = formatted.split(", ");
    const arrMMM = arr[1].split(" ");

    result = `${capitalizeFiristLetter(arr[0])}, ${arrMMM[0]} ${arrMMM[1]} ${capitalizeFiristLetter(arrMMM[2])}`;
    //result = capitalizeFiristLetter(arr[0]) + ", " + `${arrMMM[0]} ${arrMMM[1]} ${capitalizeFiristLetter(arrMMM[2])}`;
} else {
    const arr = formatted.split(", ");
    const arrMMM = arr[1].split(" "); // 15 de outubro

    //result = capitalizeFiristLetter(arr[0]) + "-Feira, " + `${arrMMM[0]} ${arrMMM[1]} ${capitalizeFiristLetter(arrMMM[2])}`;
    result = `${capitalizeFiristLetter(arr[0])}-Feira, ${arrMMM[0]} ${arrMMM[1]} ${capitalizeFiristLetter(arrMMM[2])}`;
}

return result;
}

export function addMinutesToDatetime(datetime, minutes) {
const __datetime = parseISO(datetime);
return format(addMinutes(__datetime, minutes), "yyyy-MM-dd HH:mm:ss", { locale: ptBR });
}

export function getCurrentDate() {
const now = new Date();
return(format(now, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }));
}

export function getExpirationDateOfProposal(days=7) {
    let now = new Date();
    return format(addDays(now, days), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function currency(value) {
    return value.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
}

export function MinutesToHoursNotation(minutes) {
    return (Math.floor(minutes/60)+"h "+minutes%60+" min");
}

export function priceToFloat(value) {
  const fractional = value.split(",")[1];
  const price = value.split(",")[0];
  
  return(Number(`${price.split(".").join("")}.${fractional}`));
}

export function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
}

export function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
}

export function objectIsValid(object) {
    return !(Object.keys(object).find(key => !object[key]));
}

export function onlyNumbers(v, isInt=false) {
    if(isInt) {
      v = v.replace(/\D/g,'');
    } else {
      v = v.replace(/[^\d.]|\.(?=.*\.)/g, '');
    }
    
    return v;
  }

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

export function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

export function getID(quotation) {
    const filename = !!quotation.filename ? quotation.filename : quotation.pdf_url.replace("s3-", "s3.").split(PDF_URL+"/")[1];
    const prefix = filename.split("fretamento-piquiatuba-")[1].split(".pdf")[0];
    return(`#${prefix}`);
};

export function getFilename(quotation) {
    return(!!quotation.filename ? quotation.filename : quotation.pdf_url.replace("s3-", "s3.").split(PDF_URL+"/")[1]);
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

export function Download(act) {
    window.open(act.pdf_url, '_blank');
}

export function shareOnEmail(act, history, route) {
    const state = {
        filename: getFilename(act), 
        url: act.pdf_url, 
        client_name: act.client_name, 
        type_of_transport: "aeromedical",
        current_date: act.createdAt
    };

    history.push(route, state); 
}

export function getIDFromURL(url) {
    const filename  = url.replace("s3-", "s3.").split(PDF_URL+"/")[1];
    const prefix = filename.split("fretamento-piquiatuba-")[1].split(".pdf")[0];
    return prefix;
}

export function getTransportType(type_of_transport) {
    let name = "";
    if(!!type_of_transport) {
        name=type_of_transport==="passengers"?"Passageiros":"Aeromédico";
    } else {
        name="Indefinido";
    }

    return name;
}

export function findDuplicates(arr=[], compare="") {
    let sorted_arr = arr.slice().sort();
    let results = [];
    for (let index = 0; index < sorted_arr.length - 1; index++) {
        if(sorted_arr[index+1][compare] === sorted_arr[index][compare]) {
            results.push(sorted_arr[index]);
        }
    }
    return results;
}

export function getAerodrome(q, type="") {
    const name = q[type] ? q[type].oaci_code+" • "+q[type].name : "Indefinido";
    return name;
}

export function getAircraft(q) {
    const name = q["aircraft"] ? q["aircraft"].prefix+" • "+q["aircraft"].name : "Indefinido";
    return name;
}

export function getAdmin(q) {
    const name = q["company"] ? q["company"].name : "Indefinido";
    return name;
}

export function normalizeString(text, max_length = 20) {
    let cut = text;
    if (text.length > max_length) {
      const __part = text.slice(0, max_length - 1);
      cut = `${__part.trim()}...`;
    }
  
    return cut;
}

export function objectIsEmpty(obj) {
    return Object.keys(obj).length === 0;
}
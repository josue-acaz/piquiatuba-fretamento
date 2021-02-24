import { format, getDaysInMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Retorna o dia do mês
 * @param {Date} date 
 */
export function getDayOfMonth(date) {
    const formatted = format(date, 'd', {locale: ptBR});
    return Number(formatted);
}

/**
 * @param {number} month month number, 0 based
 * @param {number} year year, not zero based, required to account for leap years
 */
export function getDaysOfMonth(month, year) {
    var date = new Date(year, month, 1);
    var days = [];
    while (date.getMonth() === month) {
        let day = new Date(date);
        days.push({
            day_of_week: day.getDay(),
            day_of_month: getDayOfMonth(day),
        });
        date.setDate(date.getDate() + 1);
    }
    return days;
}

/**
 * 
 * @param {Array<object>} days 
 * @param {number} month
 * @param {Date} prev_month
 * @param {Date} next_month
 */
export function getMonthView(days, prev_month, next_month) {
    let month_view = [];
    let month_view_days = 6*7; // 6 semanas com 7 dias cada
    let prev_month_days = getDaysInMonth(prev_month);

    for (let index = 0; index < days.length; index++) {
        const day = days[index];

        // Parte da semana do mês anterior
        if(index === 0) {
            let count_at = day.day_of_week;
            let arr_prev_month_days = [];

            while(count_at >= 1) {
                arr_prev_month_days.push({
                    day_of_week: 0,
                    day_of_month: prev_month_days,
                    current_month_day: false,
                });

                prev_month_days -= 1;
                month_view_days -=1;
                count_at -= 1;
            }

            arr_prev_month_days = arr_prev_month_days.reverse();
            for (let index = 0; index < arr_prev_month_days.length; index++) {
                const prev_month_day = arr_prev_month_days[index];
                month_view.push(prev_month_day);
            }
        }
        
        month_view_days -= 1;
        month_view.push({
            day_of_week: day.day_of_week,
            day_of_month: day.day_of_month,
            current_month_day: true,
        });
    }

    // Preencher dias restantes
    for (let index = 0; index < month_view_days; index++) {
        month_view.push({
            day_of_week: 0,
            day_of_month: index+1,
            current_month_day: false,
        });
    }

    // Criar visualização por semanas
    let calendar = [];
    let week = [];
    let week_day_count = 0;
    for (let index = 0; index < month_view.length; index++) {
        const week_days = month_view[index];
        week.push(week_days);

        if(week_day_count === 6) {
            calendar.push({week});
            week_day_count = 0;
            week = [];
        } else {
            week_day_count += 1;
        }
    }

    return calendar;
}
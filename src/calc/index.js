const tabelaPrecoUnificado = [ // Faixas de Peso Máximo para Decolagem
  //[I,      II,    III,   IV] Classe de Aeródromo
  [160.26, 92.01, 51.44, 31.31], // 1
  [160.26, 92.01, 73.31, 44.82], // 1 até 2
  [194.56, 160.12, 127.34, 76.74], // 2 até 4
  [393.58, 323.66, 258.48, 156.36], // 4 até 6
  [512.63, 421.34, 334.74, 200.18], // de 6 até 12
  [1164.37, 957.18, 761.69, 459.15], // de 12 até 14
  [2987.90, 2456.79, 1958.80, 1191.34], // de 24 até 48
  [3536.89, 2907.43, 2311.94, 1387.66], // de 48 até 100
  [5772.72, 4744.28, 4519.65, 2288.37], // de 100 até 200
  [9113.00, 7488.18, 5925.83, 3467.97], // de 200 até 300
  [15231.23, 12517.47, 9923.61, 5863.61], // mais de 300
];

// Cálculo por hora de voo
export function QuotePrice( // USANDO O PREÇO DO KM voado
  distances={
    transferDistance: 0,
    tripDistance: 0,
    returnDistance: 0
  },
  airport_classes=[], 
  aircraft={}, 
  isAeromedico=false,
  isRoundTrip=false,
  useFixedPrice=true,
  customPricePerKM=0
  ) {
  let price = 0;
  let clsPriceAerodromes = 0;

  let { transferDistance, tripDistance, returnDistance } = distances;

  tripDistance = parseInt(tripDistance);
  if(isRoundTrip) { // Quando for ida e volta, multiplicar o trecho principal por x2
    tripDistance *= 2;
  }

  transferDistance = parseInt(transferDistance);
  returnDistance = parseInt(returnDistance);
  const total_distance = tripDistance + transferDistance + returnDistance;

  const { 
      maximum_speed, 
      fixed_price_radius, 
      fixed_price_for_aeromedical_transport, 
      price_per_flight_hour_aeromedical,
      fixed_price_for_passenger_transport,
      price_per_flight_hour_passengers,
      range,
      autonomy
  } = aircraft;

  for (let index = 0; index < airport_classes.length; index++) {
    const element = airport_classes[index];
    let classPriceAerodrome = 0;
    switch (element) {
      case "I":
        if(aircraft.maximum_takeoff_weight <= 1000) {
          classPriceAerodrome = tabelaPrecoUnificado[0][0];
        }
        else if(aircraft.maximum_takeoff_weight > 1000 || aircraft.maximum_takeoff_weight <= 2000) {
          classPriceAerodrome = tabelaPrecoUnificado[1][0];
        }
        else if(aircraft.maximum_takeoff_weight > 2000 || aircraft.maximum_takeoff_weight <= 4000) {
          classPriceAerodrome = tabelaPrecoUnificado[2][0];
        }
        else if(aircraft.maximum_takeoff_weight > 4000 || aircraft.maximum_takeoff_weight <= 6000) {
          classPriceAerodrome = tabelaPrecoUnificado[3][0];
        }
        else if(aircraft.maximum_takeoff_weight > 6000 || aircraft.maximum_takeoff_weight <= 12000) {
          classPriceAerodrome = tabelaPrecoUnificado[4][0];
        }
        else if(aircraft.maximum_takeoff_weight > 12000 || aircraft.maximum_takeoff_weight <= 24000) {
          classPriceAerodrome = tabelaPrecoUnificado[5][0];
        }
        else if(aircraft.maximum_takeoff_weight > 24000 || aircraft.maximum_takeoff_weight <= 48000) {
          classPriceAerodrome = tabelaPrecoUnificado[6][0];
        }
        else if(aircraft.maximum_takeoff_weight > 48000 || aircraft.maximum_takeoff_weight <= 100000) {
          classPriceAerodrome = tabelaPrecoUnificado[7][0];
        }
        else if(aircraft.maximum_takeoff_weight > 100000 || aircraft.maximum_takeoff_weight <= 200000) {
          classPriceAerodrome = tabelaPrecoUnificado[8][0];
        }
        else if(aircraft.maximum_takeoff_weight > 200000 || aircraft.maximum_takeoff_weight <= 300000) {
          classPriceAerodrome = tabelaPrecoUnificado[9][0];
        }
        else if(aircraft.maximum_takeoff_weight > 300000) {
          classPriceAerodrome = tabelaPrecoUnificado[10][0];
        }
        break;

      case "II":
        if(aircraft.maximum_takeoff_weight <= 1000) {
          classPriceAerodrome = tabelaPrecoUnificado[0][1];
        }
        else if(aircraft.maximum_takeoff_weight > 1000 || aircraft.maximum_takeoff_weight <= 2000) {
          classPriceAerodrome = tabelaPrecoUnificado[1][1];
        }
        else if(aircraft.maximum_takeoff_weight > 2000 || aircraft.maximum_takeoff_weight <= 4000) {
          classPriceAerodrome = tabelaPrecoUnificado[2][1];
        }
        else if(aircraft.maximum_takeoff_weight > 4000 || aircraft.maximum_takeoff_weight <= 6000) {
          classPriceAerodrome = tabelaPrecoUnificado[3][1];
        }
        else if(aircraft.maximum_takeoff_weight > 6000 || aircraft.maximum_takeoff_weight <= 12000) {
          classPriceAerodrome = tabelaPrecoUnificado[4][1];
        }
        else if(aircraft.maximum_takeoff_weight > 12000 || aircraft.maximum_takeoff_weight <= 24000) {
          classPriceAerodrome = tabelaPrecoUnificado[5][1];
        }
        else if(aircraft.maximum_takeoff_weight > 24000 || aircraft.maximum_takeoff_weight <= 48000) {
          classPriceAerodrome = tabelaPrecoUnificado[6][1];
        }
        else if(aircraft.maximum_takeoff_weight > 48000 || aircraft.maximum_takeoff_weight <= 100000) {
          classPriceAerodrome = tabelaPrecoUnificado[7][1];
        }
        else if(aircraft.maximum_takeoff_weight > 100000 || aircraft.maximum_takeoff_weight <= 200000) {
          classPriceAerodrome = tabelaPrecoUnificado[8][1];
        }
        else if(aircraft.maximum_takeoff_weight > 200000 || aircraft.maximum_takeoff_weight <= 300000) {
          classPriceAerodrome = tabelaPrecoUnificado[9][1];
        }
        else if(aircraft.maximum_takeoff_weight > 300000) {
          classPriceAerodrome = tabelaPrecoUnificado[10][1];
        }
        break;
      
      case "III":
        if(aircraft.maximum_takeoff_weight <= 1000) {
          classPriceAerodrome = tabelaPrecoUnificado[0][2];
        }
        else if(aircraft.maximum_takeoff_weight > 1000 || aircraft.maximum_takeoff_weight <= 2000) {
          classPriceAerodrome = tabelaPrecoUnificado[1][2];
        }
        else if(aircraft.maximum_takeoff_weight > 2000 || aircraft.maximum_takeoff_weight <= 4000) {
          classPriceAerodrome = tabelaPrecoUnificado[2][2];
        }
        else if(aircraft.maximum_takeoff_weight > 4000 || aircraft.maximum_takeoff_weight <= 6000) {
          classPriceAerodrome = tabelaPrecoUnificado[3][2];
        }
        else if(aircraft.maximum_takeoff_weight > 6000 || aircraft.maximum_takeoff_weight <= 12000) {
          classPriceAerodrome = tabelaPrecoUnificado[4][2];
        }
        else if(aircraft.maximum_takeoff_weight > 12000 || aircraft.maximum_takeoff_weight <= 24000) {
          classPriceAerodrome = tabelaPrecoUnificado[5][2];
        }
        else if(aircraft.maximum_takeoff_weight > 24000 || aircraft.maximum_takeoff_weight <= 48000) {
          classPriceAerodrome = tabelaPrecoUnificado[6][2];
        }
        else if(aircraft.maximum_takeoff_weight > 48000 || aircraft.maximum_takeoff_weight <= 100000) {
          classPriceAerodrome = tabelaPrecoUnificado[7][2];
        }
        else if(aircraft.maximum_takeoff_weight > 100000 || aircraft.maximum_takeoff_weight <= 200000) {
          classPriceAerodrome = tabelaPrecoUnificado[8][0];
        }
        else if(aircraft.maximum_takeoff_weight > 200000 || aircraft.maximum_takeoff_weight <= 300000) {
          classPriceAerodrome = tabelaPrecoUnificado[9][2];
        }
        else if(aircraft.maximum_takeoff_weight > 300000) {
          classPriceAerodrome = tabelaPrecoUnificado[10][2];
        }
        break;

      case "IV": 
        if(aircraft.maximum_takeoff_weight <= 1000) {
          classPriceAerodrome = tabelaPrecoUnificado[0][3];
        }
        else if(aircraft.maximum_takeoff_weight > 1000 || aircraft.maximum_takeoff_weight <= 2000) {
          classPriceAerodrome = tabelaPrecoUnificado[1][3];
        }
        else if(aircraft.maximum_takeoff_weight > 2000 || aircraft.maximum_takeoff_weight <= 4000) {
          classPriceAerodrome = tabelaPrecoUnificado[2][3];
        }
        else if(aircraft.maximum_takeoff_weight > 4000 || aircraft.maximum_takeoff_weight <= 6000) {
          classPriceAerodrome = tabelaPrecoUnificado[3][3];
        }
        else if(aircraft.maximum_takeoff_weight > 6000 || aircraft.maximum_takeoff_weight <= 12000) {
          classPriceAerodrome = tabelaPrecoUnificado[4][3];
        }
        else if(aircraft.maximum_takeoff_weight > 12000 || aircraft.maximum_takeoff_weight <= 24000) {
          classPriceAerodrome = tabelaPrecoUnificado[5][3];
        }
        else if(aircraft.maximum_takeoff_weight > 24000 || aircraft.maximum_takeoff_weight <= 48000) {
          classPriceAerodrome = tabelaPrecoUnificado[6][3];
        }
        else if(aircraft.maximum_takeoff_weight > 48000 || aircraft.maximum_takeoff_weight <= 100000) {
          classPriceAerodrome = tabelaPrecoUnificado[7][3];
        }
        else if(aircraft.maximum_takeoff_weight > 100000 || aircraft.maximum_takeoff_weight <= 200000) {
          classPriceAerodrome = tabelaPrecoUnificado[8][3];
        }
        else if(aircraft.maximum_takeoff_weight > 200000 || aircraft.maximum_takeoff_weight <= 300000) {
          classPriceAerodrome = tabelaPrecoUnificado[9][3];
        }
        else if(aircraft.maximum_takeoff_weight > 300000) {
          classPriceAerodrome = tabelaPrecoUnificado[10][3];
        }
        break;
      default:
        break;
    }
    clsPriceAerodromes+=classPriceAerodrome;
  }

  if(isAeromedico) { // TRANSPORTE AEROMÉDICO
    if((total_distance <= 2*fixed_price_radius) && useFixedPrice) {
        price = fixed_price_for_aeromedical_transport;
    } else {
      if(customPricePerKM) {
        price = Math.trunc((customPricePerKM * tripDistance) + (customPricePerKM * transferDistance) + (customPricePerKM * returnDistance));
      } else {
        price = Math.trunc((price_per_flight_hour_aeromedical * (tripDistance/maximum_speed)) + (price_per_flight_hour_aeromedical * (transferDistance/maximum_speed)) + (price_per_flight_hour_aeromedical * (returnDistance/maximum_speed)));
      }
    }
  } else { // TRANSPORTE DE PASSAGEIROS
      if((total_distance <= 2*fixed_price_radius) && useFixedPrice) {
          price = fixed_price_for_passenger_transport;
      } else {
          if(customPricePerKM) {
            price = Math.trunc((customPricePerKM * tripDistance) + (customPricePerKM * transferDistance) + (customPricePerKM * returnDistance));
          } else {
            price = Math.trunc((price_per_flight_hour_passengers * (tripDistance/maximum_speed)) + (price_per_flight_hour_passengers * (transferDistance/maximum_speed)) + (price_per_flight_hour_passengers * (returnDistance/maximum_speed)));
          }
      }
  }

  // CALCULO PARA POUSO E DECOLAGEM
  if(isRoundTrip) {
    if( // PERNA PRINCIPAL (TRECHO)
      ((((tripDistance/2) > range) && ((tripDistance/2) <= 2*range)) || ((tripDistance/2)/maximum_speed > autonomy)) && ((tripDistance/2)/maximum_speed <= 2*autonomy)
    ) {
        price += (price*0.05)*2;
    }
  } else {
    if( // PERNA PRINCIPAL (TRECHO)
      ((tripDistance > range && tripDistance <= 2*range) || (tripDistance/maximum_speed > autonomy)) && (tripDistance/maximum_speed <= 2*autonomy)
    ) {
        price += price*0.05;
    }
  }

  if( // PERNA TRANSLADO ORIGEM
      (transferDistance > range && transferDistance <= 2*range) ||
      (transferDistance/maximum_speed > autonomy && transferDistance/maximum_speed <= 2*autonomy)
  ) {
      price += price*0.05;
  }

  if( // PERNA TRANSLADO DESTINO
      (returnDistance > range && returnDistance <= 2*range) ||
      (returnDistance/maximum_speed > autonomy && returnDistance/maximum_speed <= 2*range)
  ) {
      price += price*0.05;
  }

  price += Math.trunc(clsPriceAerodromes);

  return {price, clsPriceAerodromes};
}

export function GetKmPrice(
  clsPriceAerodromes=0,
  aircraft={}, 
  distances={
    transferDistance: 0,
    tripDistance: 0,
    returnDistance: 0
  },
  price=0,
  isRoundTrip=false
) {
  let kmPrice = 0;
  let { transferDistance, tripDistance, returnDistance } = distances;
  tripDistance = parseInt(tripDistance);
  if(isRoundTrip) { // Quando for ida e volta, multiplicar o trecho principal por x2
    tripDistance *= 2;
  }
  
  transferDistance = parseInt(transferDistance);
  returnDistance = parseInt(returnDistance);
  const total_distance = tripDistance + transferDistance + returnDistance;

  const { 
      maximum_speed, 
      range,
      autonomy
  } = aircraft;

  // CALCULO PARA POUSO E DECOLAGEM
  if(isRoundTrip) {
      // CALCULO PARA POUSO E DECOLAGEM
      if( // PERNA PRINCIPAL (TRECHO)
      ((((tripDistance/2) > range) && ((tripDistance/2) <= 2*range)) || ((tripDistance/2)/maximum_speed > autonomy)) && ((tripDistance/2)/maximum_speed <= 2*autonomy)
    ) {
      price -= (price*0.05)*2;
    }
  } else {
    if( // PERNA PRINCIPAL (TRECHO)
        ((tripDistance > range && tripDistance <= 2*range) || (tripDistance/maximum_speed > autonomy)) && (tripDistance/maximum_speed <= 2*autonomy)
    ) {
        price -= price*0.05;
    }
  }

  if( // PERNA TRANSLADO ORIGEM
      (transferDistance > range && transferDistance <= 2*range) ||
      (transferDistance/maximum_speed > autonomy && transferDistance/maximum_speed <= 2*autonomy)
  ) {
      price -= price*0.05;
  }

  if( // PERNA TRANSLADO DESTINO
      (returnDistance > range && returnDistance <= 2*range) ||
      (returnDistance/maximum_speed > autonomy && returnDistance/maximum_speed <= 2*range)
  ) {
      price -= price*0.05;
  }

  price -= clsPriceAerodromes;
  kmPrice = price/total_distance;
  
  return kmPrice.toFixed(2);
}

export function GetFlightTime(distance=0, speed=0) {
  return(Math.trunc((distance/speed)*60));
}
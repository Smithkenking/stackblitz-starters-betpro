export const AppMessage = {
  serviceUnavailable: 'Service is temporarily unavailable, please try again later'
};
export const fancyRankOrder = new Map([
  [0, 1],  // matchOdd
  [7, 2],  // bookMaker
  [10, 3], // manualOdds
  [14, 4], // Sportbook
  [9, 5],  // lineMarket
  [6, 6]   // adv.session
]);
export const sportRankOrder = new Map([
  ['Cricket', 1],  // cricket
]);
export const excludeSportRankOrder = new Map([
  ['Horse Racing', 1],  // cricket
]);
export function GetSortOrder(prop) {

  return function (a, b) {
    let key1 = a[prop];
    let key2 = b[prop];
    if (prop === 'ed') {
      key1 = new Date(a[prop]);
      key2 = new Date(b[prop]);
    } 
    if (key1 > key2) {
      return 1;
    } else if (key1 < key2) {
      return -1;
    }
    return 0;
  };
}
export function GetsortDescOreder(prop) {
  return function (a, b) {
    let key1 = a[prop];
    let key2 = b[prop];
    if (prop === 'ed') {
      key1 = new Date(a[prop]);
      key2 = new Date(b[prop]);
    } 
    if (key2 > key1) {
      return 1;
    } else  {
      return -1;
    }
  };
}
export function GetDateSortOrder(prop,type?: string) {

  return function (a, b) {
    let key1 = new Date(a[prop]);
    let key2 = new Date(b[prop]);
    if (type == 'desc') {
      if (key2 > key1) {
        return 1;
      } else  {
        return -1;
      }
    } else {
      if (key1 > key2) {
        return 1;
      } else if (key1 < key2) {
        return -1;
      } else {
        return 0;
      }
  }  
  };
}
export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
export function mapOrder (array, order, key) {
  
  array.sort( function (a, b) {
    var A = a[key], B = b[key];
    
    if (order.indexOf(A) > order.indexOf(B)) {
      return 1;
    } else {
      return -1;
    }
    
  });
  
  return array;
};
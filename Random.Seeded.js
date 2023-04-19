function mulberry32(a) {
  var imul = Math.imul, floor = Math.floor;
  var out = random = function() {
    var t = a += 0x6D2B79F5;
    t = imul(t ^ t >>> 15, t | 1);
    t ^= t + imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };

  out.getSeed = function() {
    return a;
  };
  out.setSeed = function(A) {
    if(typeof A === 'string'){
      a = 13;
      A.split('').reduce(function(accum, char){
        var t = a += 0x6D2B79F5 + accum + char.charCodeAt(0);
        t = imul(t ^ t >>> 15, t | 1);
        t ^= t + imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      }, 666);
    } else {
      a = A;
    }
  };
  out.setStringSeed = function(str) {
    str = str.replace(/[^0-9a-z]/g,'').substr(0,12);
    if(str.length === 0)str = '1';
    a = parseInt(str,36);
  };
  out.getStringSeed = function() {
    return a.toString(36);
  };
  out.rand = function(a, b){
    if(Array.isArray(a)){
      return a[out()*a.length|0];
    }
    var r = out();

    if(b === void 0)
      return floor(r*a);

    return floor(r*(b-a+1)+a);
  };

  Object.assign(out.rand, out);
  delete out.rand.rand;
  out.constructor = mulberry32;

  return out;
}

Math.random.seeded = mulberry32(Math.floor(Math.random()*4294967296));
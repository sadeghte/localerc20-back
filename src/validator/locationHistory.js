export default function (data) {
  if(!Array.isArray(data))
    return false;
  for(let i=0; i<data.length ; i++){
    if(typeof data[i].time === "undefined" || parseInt(data[i].time)<=0)
      return "time invalid";
    if(!Array.isArray(data[i].latLong) || data[i].latLong.length !== 2)
      return "latLong most be array of tow integer - [latitude, longitude]";
  }
  return null;
}
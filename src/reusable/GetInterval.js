export default function GetInterval(inputList = [], key) {
  
  if ( !(inputList.length > 0) ) {return;}

  let dList = [];
  const start = new Date(inputList[0][key]).getTime();
  inputList.forEach((element, index) => {
    const tm = parseInt((new Date(element[key]).getTime() - start) / 1000 / 60);
    const ts = ((new Date(element[key]).getTime() - start) / 1000) % 60;
    // const ob = {
    //   interval: tm + ":" + ts,
    // };
    dList.push(`${tm < 10 ? "0" + tm : tm}:${ts < 10 ? "0" + ts : ts}`);
    // dList.push({tm:tm, ts:ts});
  });
  return dList;
}

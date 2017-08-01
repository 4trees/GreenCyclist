var timePoint = [
	{name:'sunrise',time:[[3,0],[5,59]]},
	{name:'early AM',time:[[6,0],[6,59]]},
	{name:'AMPeak',time:[[7,0],[8,59]]},
	{name:'middayBase',time:[[9,0],[13,29]]},
	{name:'middaySchool',time:[[13,30],[15,59]]},
	{name:'PMPeak',time:[[16,0],[18,29]]},
	{name:'evening',time:[[18,30],[21,59]]},
	{name:'lateEvening',time:[[22,0],[23,59]]},
	{name:'night',time:[[0,0],[2,59]]}
	]

var seasonPoint = [
	{name:1,range:[3,4,5]},
	{name:2,range:[6,7,8]},
	{name:3,range:[9,10,11]},
	{name:4,range:[12,1,2]}]

var	file = '/data/trip.csv';

d3.queue()
  .defer(d3.csv,file,parse)
  .await(dataloaded);

function dataloaded(err, trips){
	console.log(trips)
const tripsByseason = d3.nest()
	.key(function(d){return d.season})
	.key(function(d){return d.point})
	.rollup(function(l){return {rides:l.length,totalDuration:d3.sum(l,function(el){return el.duration})}})
	.entries(trips)
console.log(tripsByseason)
}
function parse(d){

var date = new Date(d['starttime'].replace(/-/g, "/"));
var refDate = new Date(date)
var mon = date.getMonth() + 1;

var point = timePoint.find(function(t){
	var start = refDate.setHours(t.time[0][0],t.time[0][1],0)
	var end = refDate.setHours(t.time[1][0],t.time[1][1],59)
	return date >= new Date(start) && date <= new Date(end)}).name;
var season = seasonPoint.find(function(s){
	return s.range.includes(mon)}).name;
return{
    duration: +d.tripduration,
    starttime: date.getTime(),
    season: season,
    point: point
  }
}
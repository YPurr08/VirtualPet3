//Create variables here

var database;
var dog, happyDog;
var foods, foodStock;
var firebase;
var food;
var foodArray = [];
var feedTime, lastFed;
var dogImage, dogImage2, dogSprite;
var showTime = 0;
const  FOOD_COUNT = 20;
var lastTimeFedVar, lastFedHours, lastFedMin;
var stamp = 0;
var currentSec;

//var gameStage = 0; // 0-Hungry; 1-Playing; 2-Bathing
const gameStage = {
  HUNGRY: 0,
  PLAYING: 1,
  BATHING: 2,
  SLEEPING: 3
};

let currentGameStage = gameStage.HUNGRY;


function preload(){
  dogImage = loadImage("images/Full.png");
  dogImage2 = loadImage("images/Hungry.png");
  foodImage = loadImage("images/Milk.png");
  gardenImage = loadImage("Garden.png");
  sleepingImage = loadImage("Lazy.png");
  bathingImage = loadImage("Wash Room.png")
}

function setup() {
  createCanvas(1200, 600);

  dogSprite = createSprite(250,350, 30,30);
  dogSprite.addImage(dogImage);
  dogSprite.scale = 0.3;

  //initialize the firebase connection
  firebase.initializeApp(firebaseConfig);

  //create the database
  database = firebase.database();

  // Use the food variable
  foodStock = database.ref('Food');

  //On is a function handler which reads changes to the food variable
  foodStock.on('value', readStock);

  feedTime = database.ref('FeedTime');
  feedTime.on("value", function(database){
      lastFed = 0;
  });

  setTimeout(showFood, 5000);
}


function draw() {
  background(46, 139, 87);
  if(currentGameStage == gameStage.HUNGRY)
  {
    PaintFeedAddFoodItem();
  }

  gameStageSettings();
  

  //Populate the food left and last fed
  fill(255,255,255);
  text("Food Left: "+foods, 180, 30);

  feedTime.on("value", function(database){
    lastFed = database.val();
  });
  text("Last Feed:" + lastFed, 350,30);

  


  //draw all sprites
  drawSprites();
}


// Readstock is a asynchronous
function readStock (database){
  foods = database.val();
  if (foods == null)
  {
    foods = FOOD_COUNT;
  }
}

function showFood(){
  for(var i = 0; i < foods; i++){
    if(i <= foods/2 - 1){
      foodArray[i] = createSprite(640 + i * 30, 300, 20, 20)
      foodArray[i].addImage(foodImage);
      foodArray[i].scale = 0.1;
    }
    else
    {
      foodArray[i] = createSprite(610 + (i - foods/2 + 1) * 30, 380, 20, 20)
      foodArray[i].addImage(foodImage);
      foodArray[i].scale = 0.1;
      foodArray[i].visible = true;
    }
  }
  //console.log(foodArray);
}

function HideFood()
{
  console.log("HideFood")
  for(var i = 0; i < foods; i++)
  {
    //console.log(foodArray);

    if (foodArray != null)
    {
      console.log("making invisible:" + i);
      foodArray[i].visible = false;
    }
  }
  //foodArray = null;
}

function feedDog(){
  console.log(foods);
  if(foods > 0){
    // make the bottle fed as invisible
    foods = foods - 1;
    console.log("foods" +foods);
    console.log(foodArray);
    foodArray[foods].visible = false;

    // Populate the last fed time and update the database
  var currentdate = new Date();
  lastFedHours = currentdate.getHours();
  lastFedMin = currentdate.getMinutes();
  lastFedSec = currentdate.getSeconds();
  stamp = lastFedHours + ":" + lastFedMin + " " + lastFedSec;
  firebase.database().ref().set({["FeedTime"] : stamp});
  text(stamp, 900, 30);

  // Update the lastTimeFed in seconds for comparision
  lastTimeFedVar = lastFedSec + lastFedMin*60 + lastFedHours*3600;

  // change the state from hungry to playing
  currentGameStage = gameStage.PLAYING;
  }


}

function addFood(){
  if (foods < FOOD_COUNT && foods >= 0)
  {
    foods = foods + 1;
    foodArray[foods-1].visible = true;
  }
}

function gameStageSettings()
{
  UpdateCurrentTime();

  

  switch(currentGameStage)
  {
    case gameStage.HUNGRY:
    // Do something for hungry state
      //background(46, 139, 87);
      console.log("Hungry");
      console.log("gameStage:" + currentGameStage);
      console.log("lastTimeFedVar:" + lastTimeFedVar);
      console.log("CurrentSec:" + currentSec);
      break;

    case gameStage.PLAYING:
    //Do something for playing state
      console.log("PLAYING");
      console.log("gameStage:" + currentGameStage);
      console.log("lastTimeFedVar:" + lastTimeFedVar);
      console.log("CurrentSec:" + currentSec);
      dogSprite.visible = false;
      HideFood();
      background(gardenImage);

      if(abs(currentSec - lastTimeFedVar) > 10){
        currentGameStage = gameStage.BATHING;
        UpdateCurrentTime();
      }
      break;


    case gameStage.BATHING:
      //Do something for bathing state
      console.log("BATHING");
      console.log("gameStage:" + currentGameStage);
      console.log("lastTimeFedVar:" + lastTimeFedVar);
      console.log("CurrentSec:" + currentSec);
      background(bathingImage);

      if(abs(currentSec - lastTimeFedVar) > 20){
        currentGameStage = gameStage.SLEEPING;
        UpdateCurrentTime();
      }
      break;


    case gameStage.SLEEPING:
    //Do something for sleeping state
      console.log("SLEEPING");
      console.log("gameStage:" + currentGameStage);
      console.log("lastTimeFedVar:" + lastTimeFedVar);
      console.log("CurrentSec:" + currentSec);
      background(46, 139, 87);
      dogSprite.addImage(sleepingImage);
      if(abs(currentSec - lastTimeFedVar) > 30){
        currentGameStage = gameStage.HUNGRY;
        dogSprite.visible = true;
        visibleFood();
        UpdateCurrentTime();
      }
      break;

    }
  


  // if(abs(currentSec - lastTimeFedVar) > 10){
  //   console.log("PLAYING");
  //   background(gardenImage);
  //   currentHour = NowHour.getHours();
  //   currentMin = NowHour.getMinutes();
  //   currentSec = NowHour.getSeconds() + currentMin * 60 + currentHour * 3600;
  // }

  // if(abs(currentSec - lastTimeFedVar) > 15){
  //   console.log("SLEEPING");
  //   background("white");
  //   background(sleepingImage);
  //   currentHour = NowHour.getHours();
  //   currentMin = NowHour.getMinutes();
  //   currentSec = NowHour.getSeconds() + currentMin * 60 + currentHour * 3600;
  // }

  // if(abs(currentSec - lastTimeFedVar) > 20){
  //   console.log("HUNGRY");
  //   dogSprite.addImage(dogImage2);
  //   currentHour = NowHour.getHours();
  //   currentMin = NowHour.getMinutes();
  //   currentSec = NowHour.getSeconds() + currentMin * 60 + currentHour * 3600;
  // }
}

function PaintFeedAddFoodItem(){
  //Create FEED Button
  feed = createButton("Feed Odie");
  feed.position(1400, 60);

  //Create ADD Button
  add = createButton("Add Food Item");
  add.position(1250, 60);

  // Attach the mouse pressed events
  feed.mousePressed(feedDog);
  add.mousePressed(addFood);

}



function UpdateCurrentTime()
{
  var NowHour = new Date();

  currentHour = NowHour.getHours();
  currentMin = NowHour.getMinutes();
  currentSec = NowHour.getSeconds() + currentMin * 60 + currentHour * 3600;
}

function visibleFood(){
  console.log("HideFood")
  for(var i = 0; i < foods; i++)
  {
    //console.log(foodArray);

    if (foodArray != null){
      console.log("making visible:" + i);
      foodArray[i].visible = true;
    }
  }
}

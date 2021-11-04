window.onload = function(){

  var canvas = document.getElementById("canvas"),
  context = canvas.getContext("2d"),
  width = canvas.width = window.innerWidth,
  height = canvas.height = window.innerHeight;

  var LOADING = 0,
      MENU = 1,
      SELECT_WEAPON,
      PLAY = 2,
      GAMEOVER = 3,
      OPTIONS = 4,
      HELP = 5;
  var current_state = LOADING;
  var CROSS = 1,
      CIRCLE = 2;
  var PLAYER_TURN = 1,
      AI_TURN = 2;
  var TIED = 3;

  var current_turn = PLAYER_TURN;
  var winner;

  var gridPos = {
    x: width/2,
    y: height/2
  };
  var grid = new Array(3);
  var hitBoxes = new Array(3);
  var GRID_SIZE = 50;

  var reset_flag = true;

  for(var i =0 ; i < 3; i++){
    grid[i] = new Array(3);
    hitBoxes[i] = new Array(3);
  }

  /****For MENU
  ***/
  var menuHitBoxes = [];
  var hitBoxWidth = 150,
      hitBoxHeight = 40,
      hitBoxVSpace = 20;
  //menu grid animation
  var t = 0;

  for(var i = 0; i < 3; i++){
    menuHitBoxes.push({
      x: width/6 - hitBoxWidth/2,
      y: (i - 1) * (hitBoxHeight + hitBoxVSpace) + height/2,
      width: hitBoxWidth,
      height: hitBoxHeight
    });
  }

  //Try sounds
  var assetsLoaded = 0;
  var assets = [];

  var menu_click = document.getElementById("menuclick");
  menu_click.addEventListener("canplaythrough", loadHandler , false);
  menu_click.load();
  assets.push(menu_click);

  var click1 = document.getElementById("click1");
  click1.addEventListener("canplaythrough", loadHandler, false);
  click1.load();
  assets.push(click1);

  function loadHandler(){
    assetsLoaded++;
    if(assets.length == assetsLoaded){
      current_state = MENU;
    }
  }


  // BUG: This Code killed my PC
  // Sure to kill because i am looping through length of boxes
  // and constantly adding box in boaxes changing it's length to even more higher
  // for(var i = 0; i < hitBoxes.length; i++){
  //   for(var j = 0; j < hitBoxes[0].length; j++){
  //     var rect = {
  //       x: gridPos.x + (j - 1) * GRID_SIZE,
  //       y: gridPos.y + (i - 1) * GRID_SIZE,
  //       width: GRID_SIZE,
  //       height: GRID_SIZE
  //     };
  //     hitBoxes.push(rect);
  //   }
  // }

  function init(){
    for(var i = 0; i < hitBoxes.length; i++){
      for(var j = 0; j < hitBoxes[i].length; j++){
        var rect = {
          x: gridPos.x + (j - 1) * GRID_SIZE,
          y: gridPos.y + (i - 1) * GRID_SIZE,
          width: GRID_SIZE,
          height: GRID_SIZE
        };
        hitBoxes[i][j] = rect;
        grid[i][j] = 0;
      }
    }
  }

  init();
  update();

  function update(){
    switch(current_state){
      case LOADING:
      console.log("loading...");
      break;
      case PLAY:
      if(reset_flag){
        resetGame();
      }
      updateGame();
      renderGame();
      break;
      case SELECT_WEAPON:
      // renderSelectWeapon();
      break;
      case GAMEOVER:
      // updateGameOver();
      renderGameOver();
      break;
      case MENU:
      renderMenu();
      renderGame();
      break;
      case OPTIONS:
      renderOptions();
      break;
      case HELP:
      renderHelp();
      break;
    }


    requestAnimationFrame(update);
  }


  function updateGame(){
    if(winner == undefined){
      if(current_turn == AI_TURN){
        doAITurn();
        checkIfGameWon(AI_TURN);
      }
    } else {
      current_state = GAMEOVER;
    }
  }


  function doAITurn(){
    var playerMoved = [];
    for(var i = 0; i < grid.length; i++){
      for(var j = 0; j < grid[i].length; j++){
        if(grid[i][j] == PLAYER_TURN){
          playerMoved.push({i: i, j: j});
        }
      }
    }
    if(playerMoved.length <= 1){
      doRandomMove();
    } else {
      var toMove = determineAIMove();
      if(toMove != null){
        grid[toMove.i][toMove.j] = AI_TURN;
        current_turn = PLAYER_TURN;
      } else {
        doRandomMove();
      }
    }
  }

  function doRandomMove(){
    var indexH = utils.randomInt(0, 2);
    var indexV = utils.randomInt(0, 2);
    if(grid[indexV][indexH] == 0){
      grid[indexV][indexH] = AI_TURN;
      current_turn = PLAYER_TURN;
    }
  }

  function determineAIMove(){
    for(var i = 0; i < grid.length; i++){
      for(var j = 0; j < grid[0].length; j++){
        if(grid[i][j] == 0){
          if(checkIfGameWillBeWon(i, j, AI_TURN)){
            console.log("I can win!");
            return {i: i, j: j};
          }
        }
      }
    }
    for(var i = 0; i < grid.length; i++){
      for(var j = 0; j < grid[0].length; j++){
        if(grid[i][j] == 0){
          if(checkIfGameWillBeWon(i, j, PLAYER_TURN)){
            console.log("He can win!");
            return {i: i, j: j};
          }
        }
      }
    }

    return null;
    // for(var i = 0; i < playerMoved.length; i++){
    //   var p = playerMoved[i];
    //   if(checkIfGameWillBeWon(p.i, p.j)){
    //
    //   }
    // }
  }

  function checkIfGameWillBeWon(i, j, turn){
    if(i < 0 || i > 2){
      return false;
    }
    if(j < 0 || j > 2){
      return false;
    }
    grid[i][j] = turn;
    if(grid[0][0] == turn && grid[0][1] == turn && grid[0][2] == turn||
       grid[1][0] == turn && grid[1][1] == turn && grid[1][2] == turn||
       grid[2][0] == turn && grid[2][1] == turn && grid[2][2] == turn||
       grid[0][0] == turn && grid[1][0] == turn && grid[2][0] == turn||
       grid[0][1] == turn && grid[1][1] == turn && grid[2][1] == turn||
       grid[0][2] == turn && grid[1][2] == turn && grid[2][2] == turn||
       grid[0][0] == turn && grid[1][1] == turn && grid[2][2] == turn||
       grid[0][2] == turn && grid[1][1] == turn && grid[2][0] == turn){
         grid[i][j] = 0;
         return true;
       } else {
         grid[i][j] = 0;
         return false;
       }
  }



  /************ Shit AI ***********
  // function doAITurn(){
  //   var playerPossible = [];
  //   for(var i = 0; i < grid.length; i++){
  //     for(var j = 0; j < grid[i].length; j++){
  //       if(grid[i][j] == PLAYER_TURN) {
  //         playerPossible.push({i: i, j: j});
  //       }
  //     }
  //   }
  //   if(playerPossible.length == 0){
  //     var indexH = utils.randomInt(0, 2);
  //     var indexV = utils.randomInt(0, 2);
  //     if(grid[indexV][indexH] == 0)
  //       grid[indexV][indexH] = AI_TURN;
  //   } else {
  //     var randomIndex = utils.randomInt(0, playerPossible.length - 1);
  //     var moveIndex = determineAIMove(playerPossible[randomIndex].i, playerPossible[randomIndex].j);
  //     if(!moveIndex){
  //       var indexH = utils.randomInt(0, 2);
  //       var indexV = utils.randomInt(0, 2);
  //       if(grid[indexV][indexH] == 0){
  //         grid[indexV][indexH] = AI_TURN;
  //       } else {
  //         return false;
  //       }
  //     } else {
  //       grid[moveIndex.i][moveIndex.j] = AI_TURN;
  //     }
  //   }
  // }
  //
  // function determineAIMove(i, j){
  //   var possibleMove = [];
  //   if(i + 1 <= 2){
  //     if(grid[i + 1][j] == 0){
  //       possibleMove.push({i: i + 1, j: j});
  //     }
  //   }
  //   if(i - 1 >= 0){
  //     if(grid[i - 1][j] == 0){
  //       possibleMove.push({i: i - 1, j: j});
  //     }
  //   }
  //   if(j + 1 <= 2){
  //     if(grid[i][j + 1] == 0){
  //       possibleMove.push({i: i, j: j + 1});
  //     }
  //   }
  //   if(j - 1 >= 0){
  //     if(grid[i][j - 1] == 0){
  //       possibleMove.push({i: i, j: j - 1});
  //     }
  //   }
  //   if(possibleMove.length == 0){
  //     return false;
  //   }
  //   return possibleMove[utils.randomInt(0, possibleMove.length - 1)];
  // }
  *********/

  function checkIfGameWon(turn){
    if(grid[0][0] == turn && grid[0][1] == turn && grid[0][2] == turn||
       grid[1][0] == turn && grid[1][1] == turn && grid[1][2] == turn||
       grid[2][0] == turn && grid[2][1] == turn && grid[2][2] == turn||
       grid[0][0] == turn && grid[1][0] == turn && grid[2][0] == turn||
       grid[0][1] == turn && grid[1][1] == turn && grid[2][1] == turn||
       grid[0][2] == turn && grid[1][2] == turn && grid[2][2] == turn||
       grid[0][0] == turn && grid[1][1] == turn && grid[2][2] == turn||
       grid[0][2] ==turn &&  grid[1][1] == turn && grid[2][0] == turn){
         winner = turn;
       }

      //This loop checks wether all the holes are filled if not then return
      //to called function otherwise go to end statement
      //which sets current_state to GAMEOVER indicating all holes are filled
      //and noone as winner (undefined)
     for(var i = 0; i < grid.length; i++){
       for(var j = 0; j < grid[i].length; j++){
         if(grid[i][j] == 0) return;
       }
     }
     if(winner == undefined){
       winner = TIED;
     }
  }

  function resetGame(){
    for(var i = 0; i < grid.length; i++){
      for(var j = 0; j < grid[0].length; j++){
        grid[i][j] = 0;
      }
    }
    winner = undefined;
    reset_flag = false;
  }

  function renderGame(){
    context.clearRect(width/4, 0, width ,height * 0.79);
    if(current_state == PLAY){
      context.globalAlpha = 0.01;
      context.fillStyle = "#fff";
      context.fillRect(width * 0.05, height/2 - height * 0.1, width/4, height/4);
      context.globalAlpha = 1;
    } else {
      context.save();
      context.fillStyle = "#645";
      context.fillText("Before you start tapping here!, You need to press New Game", width/2, height * 0.2);
      context.fillText("Blink, Blink, Blink", width/2, height * 0.25);
      context.restore();
    }
    context.save();
    context.translate(gridPos.x, gridPos.y);
    context.lineWidth = 3;
    if(current_state == MENU){
      context.lineWidth = Math.sin(t+=0.05) * 2;
    }
    for(var i = 0; i < grid.length; i++){
      for(var j = 0; j < grid[0].length; j++){
        var y = (i - 1) * GRID_SIZE,
            x = (j - 1) * GRID_SIZE;
        if(grid[i][j] == 0){
          context.beginPath();
          context.rect(x, y, GRID_SIZE, GRID_SIZE);
          context.stroke();
        } else if(grid[i][j] == CROSS){
          context.beginPath();
          context.rect(x, y, GRID_SIZE, GRID_SIZE);
          context.moveTo(x, y);
          context.lineTo(x + GRID_SIZE, y + GRID_SIZE);
          context.moveTo(x + GRID_SIZE, y);
          context.lineTo(x, y + GRID_SIZE);
          context.stroke();
        } else if(grid[i][j] == CIRCLE){
          context.beginPath();
          context.rect(x, y, GRID_SIZE, GRID_SIZE);
          context.stroke();
          context.beginPath();
          context.arc(x  + GRID_SIZE/2, y + GRID_SIZE/2, GRID_SIZE/3, 0, Math.PI * 2, false);
          context.stroke();
        }
      }
    }
    context.restore();
  }


  function renderGameOver(){
    context.font = "25px Consolas";
    context.textBaseline = "middle";
    context.textAlign = "center";
    if(winner == PLAYER_TURN){
      context.fillText("PLAYER WON, HOW CAN I LOSE, NOOOOOOO!!!!!", width/2, height/2 );
    } else if(winner == AI_TURN){
      context.fillText("I WON, YOU ARE JUST PUNY LITTLE HUMAN!", width/2, height/2 );
    } else {
      context.fillText("IT'S JUST A LUCK BRO THAT YOU TIED!", width/2 + GRID_SIZE, height/2);
    }
  }

  function renderMenu(){
    context.clearRect(0, 0, width/4, height);
    context.clearRect(width/4, height * 0.8, width, height);
    context.fillRect(width/4, height * 0.8, width * 0.6, height * 0.19);
    context.font = "20px Consolas";
    context.textBaseline = "middle";
    context.textAlign = "center";
    context.shadowBlur = 5;
    context.shadowColor = "#f6e";
    for(var i = 0; i < menuHitBoxes.length; i++){
      var b = menuHitBoxes[i];
      context.fillStyle = "#000";
      context.fillRect(b.x, b.y, b.width, b.height);
      context.fillStyle = "#fff";
      if(i == 0){
        context.fillText("New Game", b.x + b.width/2, b.y + b.height/2);
      } else if(i == 1){
        context.fillText("Options", b.x + b.width/2, b.y + b.height/2);
      } else if(i == 2){
        context.fillText("Help", b.x + b.width/2, b.y + b.height/2);
      }
    }
  }

  function renderOptions(){
    context.clearRect(width/4, height * 0.8, width, height);
    context.fillRect(width/4, height * 0.8, width * 0.6, height * 0.19);
    context.save();
    context.shadowBlur = 1;
    context.fillStyle = "#645";
    context.fillText("I am very sorry that there arree .. .  . NO OPTIONS FOR YOU BECAUSE", width * 0.56, height * 0.85);
    context.fillText(" I AM GONNA CRUSH YOU AND TEAR DOWN EVERY BITS AND PIECES FROM YOU!", width * 0.56, height * 0.9);
    context.restore();
  }

  function renderHelp(){
    context.clearRect(width/4, height * 0.8, width, height);
    context.fillRect(width/4, height * 0.8, width * 0.6, height * 0.19);
    context.save();
    context.shadowBlur = 1;
    context.fillStyle = "#645";
    context.fillText("Seriously, Do you need help playing Tic Tac Toe?", width * 0.56, height * 0.85);
    context.fillText("Shame on your childhood!", width * 0.56, height * 0.9);
    context.restore();
  }

  //Input Controls
  document.body.addEventListener("mouseup", function(event){
    switch(current_state){
      case MENU:
      handleMenuInput();
      break;
      case PLAY:
      handleGamePlayInput();
      break;
      case GAMEOVER:
      reset_flag = true;
      current_state = MENU;
      break;
      case OPTIONS:
      current_state = MENU;
      break;
      case HELP:
      current_state = MENU;
      break;
    }

  });

  function handleGamePlayInput(){
    if(current_turn == PLAYER_TURN){
      for(var i = 0; i < hitBoxes.length; i++){
        for(var j = 0; j < hitBoxes[0].length; j++){
          if(utils.pointInRect(hitBoxes[i][j] , event.clientX, event.clientY)){
            if(grid[i][j] != CROSS && grid[i][j] != CIRCLE){
              click1.play();
              grid[i][j] = PLAYER_TURN;
              checkIfGameWon(PLAYER_TURN);
              current_turn =  AI_TURN;
              break;
            }
          }
        }
      }
    } else {
      console.log("it's my turn, you need to wait!");
    }
  }

  function handleMenuInput(){
    for(var i = 0; i < menuHitBoxes.length; i++){
      if(utils.pointInRect(menuHitBoxes[i], event.clientX, event.clientY)){
        menu_click.play();
        if(i == 0){
          current_state = PLAY;
        } else if(i == 1){
          current_state = OPTIONS;
        } else if(i == 2){
          current_state = HELP;
        }
      }
    }
  }

};

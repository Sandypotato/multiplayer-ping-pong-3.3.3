const socket = io({
    transports: ["websocket"]
  });
  let currentRoomCode = null;
  let amIFirst = false
  window.onload = () => {
    const join_option_input = prompt('Select: "CREATE" or "JOIN"', "CREATE");
    if (join_option_input === "CREATE") {
        socket.emit("requestCreateRoom");
        amIFirst = true
    } else if (join_option_input === "JOIN") {
        const room_code_input = prompt("Enter Room Code");
        socket.emit("requestJoinRoom", room_code_input);
        amIFirst = false
    } else {
        window.onload();
    }
  };
  
  socket.on("setRoomCode", (code) => {
    currentRoomCode = code;
  });
  socket.on('roomFull', (data) => {
    if(data){
      alert("Room is full, pick another room")
    }
  })
  
socket.on('newBall', (data) => {
    if(data.id == currentRoomCode){
        if(data.newBall == true){
            //myBall = 0;
            //myBall = new ball()
        }
    }
})

  class paddle{
    constructor(x){
        this.sprite = new Sprite()
        this.sprite.x = x
      this.sprite.y = 0.5* height
      this.sprite.w = 10
      this.sprite.h = 50
      this.sprite.collider = 'static'
    }
  
    moveDown(speed){
      this.sprite.y -= speed
    }
  
    moveUp(speed){
      this.sprite.y += speed
    }
  
    draw(){
      rect(this.x, this.y, this.w, this.h)
    }
  }
  
  class ball{
    constructor(){
        this.sprite = new Sprite()
        this.sprite.x = 0.5 * width
        this.sprite.y = 0.5 * height
        this.sprite.d = 20
        
    }

    updatePosition(x, y){
        this.sprite.x = x;
        this.sprite.y = y;
    }
  }

  let positions = {}
  let cnv
  let myBall
  let balls = {}
  let numPlayers = 1
  let ballData
  let endgame = false
  let didYouWin = false
  let paddles = []
  let myPaddle
  function setup(){
    new Canvas(1000, 600)
    //ball = new paddle(0.2 * width)
    //balls[socket.id] = ball
    if(amIFirst == true){
        myPaddle = new paddle(0.2 * width)
        paddles.push(myPaddle)
        paddles.push(new paddle(0.8 * width))
    }else{
        paddles.push(new paddle(0.2 * width))
        myPaddle = new paddle(0.8 * width)
        paddles.push(myPaddle)
        
    }
    myBall = new ball()
    fill(255)
    frameRate(30)
    let text_layer = new Sprite();
    text_layer.visible = false;
    text_layer.collider = "none";
    text_layer.update = () => {
        textAlign(CENTER, CENTER);
        textSize(32);
        text(`Room Code: ${currentRoomCode}`, 0, 50, width, 50);
    };
  }
  socket.on("positions", (data) => {
    //get the data from the server to continually update the positions
    //positions = data;
    for(let room of data){
      if(room.id == currentRoomCode){
        positions = room.positions
      }
    }
   
  });
  
  
  socket.on("newPlayer", (data) => {
    numPlayers++;
    //balls[data] = new paddle(0.8 * width)
  });
  let shake = false
  socket.on('winner', (data) => {
    console.log('winner received')
    if(data[2] == currentRoomCode){
      if(data[0] == socket.id) {
      endgame = data[1]
      didYouWin = true
        shake = true
    }else{
      endgame = data[1]
      didYouWin = false
    }
    }
    
  })
  let points = [0, 0]
  socket.on('points', (data) => {
    if(data.id == currentRoomCode){
      points = data.points
    }
  })
  
  socket.on('powerUp', (data) => {
    if (data) {
      myPaddle.h = 100
    }
  })
  
socket.on('otherPlayerPos', (data) => {
    //balls[data.id].sprite.x = data.position.x
    //balls[data.id].sprite.y = data.position.y
})

socket.on('otherPlayerPosition', (data) => {
    //balls[data.id].sprite.x = data.position[0]
    //balls[data.id].sprite.y = data.position[1]
    if(data.position[0] == 0.2){
        paddles[0].sprite.y = data.position[1] * height
    }else if(data.position[0] == 0.8){
        paddles[1].sprite.y = data.position[1] * height
    }
})
  let ballPositions = []
  
  function draw(){
    background(0)
    if(ballPositions.length > 3){
      ballPositions = []
    }
    textSize(32)
    text(`${points[0]} : ${points[1]}`, width/2, height / 3)
    
    let buffer = []
    let paddleBuffer = []
    for(const id in positions){
      
      if(id == 'ball'){
        let ballData = positions['ball']
        let ballPosX = ballData.x * width
        let ballPosY = ballData.y * height
        //let ballClass = new Ball(ballPosX, ballPosY, ballData.diameter/2)
        //ballPositions.push(ballClass)
        fill(ballData.colour[0], ballData.colour[1], ballData.colour[2])
        //buffer.push(ballPosY)
        myBall.updatePosition(ballPosX, ballPosY)
        //circle(ballPosX, (ballPosY - (buffer[buffer.length-1]) * 0.1), ballData.diameter)
        fill('white')
        let cooldown = true
        if(paddles[0].sprite.collides(myBall.sprite)){
            
            if(cooldown){
                 console.log('collision')
                socket.emit('ballCollision', {
                    x: paddles[0].sprite.x,
                    collide: true,
                    room: currentRoomCode
                })
            }
            
        }
        if(paddles[1].sprite.collides(myBall.sprite)){
            console.log('collision')
                socket.emit('ballCollision', {
                    x: paddles[1].sprite.x,
                    collide: true,
                    room: currentRoomCode
                })
        }
        
      }else if(id == 'powercube'){
        let powercubeData = positions['powercube']
        for(const powercube of powercubeData){
          let powercubePosX = powercube.x * width
          let powercubePosY = powercube.y * height
          fill(powercube.colour[0], powercube.colour[1], powercube.colour[2])
          rect(powercubePosX, powercubePosY, powercube.w, powercube.h)
          fill('white')
        }
      }else{
        const position = positions[id]

        //ballPositions.push(new Ball(positions[id].x * width, positions[id].y * height, 50))
        //paddleBuffer.push(position.y * height)
          //rect(position.x * width, position.y * height, 10, position.h)
          //if(id !== socket.id){
            //balls[id].sprite.x = position.x
            //balls[id].sprite.y = position.y
          //}
        
        
      }
  //collision detection between ball and paddle
  
    }
  
  /*  for(let i=0;i<ballPositions.length;i++){
      ballPositions[i].update()
      ballPositions[i].display()
      if(i !== 0){
        ballPositions[0].checkCollision(ballPositions[i])
      }
    }*/
  
  
    
    if(didYouWin == true && endgame == true) {
      textAlign(CENTER)
      textSize(32)
      text('YOU WON!', width/2, height/2)
      //noLoop()
    }else if(endgame == true && didYouWin == false){
      textAlign(CENTER)
      textSize(32)
      text('YOU LOST!', width/2, height/2)
      if(shake){
        translate(random(-5,5),random(-5,5));
      }
      if(frameCount % 300 == 0){
        shake = false
      }
      //noLoop()
    }
    move()
    socket.emit("updatePosition", {
      y: myPaddle.sprite.y / height
    })
  }
  
  
  
  function move(){
    const SPEED = 10;
    if (kb.pressing("w")) {
        myPaddle.sprite.y -= SPEED
    }
    
    if (kb.pressing("s")) {
        myPaddle.sprite.y += SPEED
    }
    
  }
  
  
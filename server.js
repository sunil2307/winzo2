const express = require("express")
const app = express()
const cors = require("cors");
const { count } = require("console");
const { Axios } = require("axios");
const axios = require('axios');
const http = require('http').Server(app);
const PORT = 4000
const socketIO = require('socket.io')(http, {
    cors: {
        //origin: "http://localhost:3000"
    }
});

app.use(cors())
let users = []
var Count=0;
//var URL="http://localhost/teenpatti/api/";
var URL="http://www.sgtdigiworld.com/teenpatti/api/";
var DrCount=0;
var TiCount=0;
var TrCount=0;
var DrCountBot=0;
var TiCountBot=0;
var TrCountBot=0;
var GameH=[];
var GameWinFlag=0;
var GameWin="";
var FinalGameWin="";
var LastGameID="";
function GetGameH()
{
    axios.get(URL+"GameH3",{
        params: {
            contact: "",
        }
    }).then((response) => {

     GameH=response.data;
//console.log(GameH[0].Win);
GameH.forEach(element => {
  //console.log(element.Win);
});
    });
}
function GetGameWinFlag()
{
    axios.get(URL+"GameWin",{
        params: {
            game: "DrTr",
        }
    }).then((response) => {

GameWinFlag= response.data[0].Flag;
GameWin= response.data[0].Win;
    });
}
function LastID()
{
    axios.get(URL+"GetDrTrGameId",{
        params: {
            game: "DrTr",
        }
    }).then((response) => {

LastGameID= response.data.Id;

    });
}

function UpdateBot(UserId)
{
//   const formData =new FormData();
//   formData.append("userID",UserId);
//   formData.append("balance",29);
//   axios.post("http://localhost/teenpatti/api/UpdateBot", 
//   formData,
//   {
//     headers:{
//               'Content-Type':'multipart/form-data'
//              }
//    })
// .then((response) => {	

// console.log(response.data);

//     });
 
axios.post(URL+"UpdateBot",null,{
        params: {
          userID: UserId,
          balance:29
        }
    }).then((response) => {



    });

}
function AddGame(win,balance,dr,ti,tr)
{
  axios.get(URL+"GetDrTrGameId",{
    params: {
        game: "DrTr",
    }
}).then((response) => {

LastGameID= response.data.Id;
LastGameID++;




//console.log(LastGameID);
 var date=new Date();
axios.post(URL+"AdddrtrgameGameData",null,{
  params: {
    date: date,
   win:win,
   balance:balance,
   dr:dr,
   ti:ti,
   tr:tr,
   id:LastGameID,
  }
    }).then((response) => {

      axios.post(URL+"UpdateGameWin",null,{
        params: {
          id:LastGameID,
         win:win,
        
        
        }
          }).then((response2) => {
      
            axios.get(URL+"GetWinBal",{
              params: {
                id:LastGameID,
               win:win,
              
              
              }
                }).then((response3) => {
            
                  response3.data.forEach(element => {
                    var UserIDNew=element.UserId;
                    var UPdateBal=0;
                    
                      UPdateBal=element.Win;
                    
                    //console.log(UserIDNew,UPdateBal);
                    axios.post(URL+"UpdateBotAdd",null,{
                      params: {
                        userID:UserIDNew,
                        balance:UPdateBal,
                      
                      
                      }
                        }).then((response4) => {
                    
                        // console.log(response4.data);
                    
                        });
                 });
            
                });
      
          });

    });
  });
}
function UpdateGame(win,balance,dr,ti,tr)
{
 
 var date=new Date();
axios.post(URL+"UpdateGame",null,{
        params: {
          date: date,
         win:win,
         balance:balance,
         dr:dr,
         ti:ti,
         tr:tr,
         id:LastGameID,
        }
    }).then((response) => {

//console.log(response);

    });

}

var timeleft = 0;
function server()
{


  const GNames = [
    "Ti",
    "Dr",
    "Tr"
    
  ];
  const GNamesWin = [
   
    "Dr",
    "Tr"
    
  ];
  const Unames = [
    "U1",
    "U2",
    "U3",
    "U4",
    "U5",
    "U6"
    
  ];

   
    
  
   var data=1.0;
   for(var i=0;i<=data;i++){ 
    
    timeleft = 26;
   
  var downloadTimer = setInterval(function(){
    
    if(timeleft<16)
    {
    socketIO.emit("GameStart","Start");
    if(timeleft <= 0){
      
      
      clearInterval(downloadTimer);
     
      socketIO.emit("CountDown","0");
      socketIO.emit("GameNoti","Stop Betting.....");
      socketIO.emit("TotalDrC", DrCount)
      socketIO.emit("TotalTiC", TiCount)
      socketIO.emit("TotalTrC", TrCount)
      GetGameWinFlag();
      GetGameH();
      
      
      //test("Hello");
     
      if(GameWinFlag=="1")
      {
       
        socketIO.emit("Win", GameWin)
        FinalGameWin=GameWin;
            
      }
      else
      {
        var Diff=Math.abs(DrCount-TrCount)
        if(Diff>5000)
        {
             if(DrCount>TrCount)
             {
              socketIO.emit("Win", "Tr")
              FinalGameWin="Tr";
             }
             else{
              socketIO.emit("Win", "Dr")
              FinalGameWin="Dr";
            }
           
        }
        else{
          FinalGameWin=Math.floor(Math.random() * GNamesWin.length);
         
          socketIO.emit("Win", GNamesWin[FinalGameWin])
          FinalGameWin=GNamesWin[FinalGameWin];
         
        }
      }
     
     var MainDR=DrCount-DrCountBot;
      var MainTi=TiCount-TiCountBot;
      var MainTr=TrCount-TrCountBot;
      var MainBalance=MainDR+MainTi+MainTr;
      
      
      AddGame(FinalGameWin,MainBalance,MainDR,MainTi,MainTr);
    

    
      socketIO.emit("GameFin", "GameFinish");
      
       DrCount=0;
       TiCount=0;
       TrCount=0;
       DrCountBot=0;
       TiCountBot=0;
       TrCountBot=0;
       LastGameID="";
    data=data+0.000000000001;
    timeleft = 26;
   
    //AddGame();
    
      //socketIO.emit("GameFinish","Finish");
    } else {
     
      
      socketIO.emit("CountDown",timeleft);
      socketIO.emit("GameNoti",timeleft);
      socketIO.emit("TotalDrC", DrCount)
      socketIO.emit("TotalTiC", TiCount)
      socketIO.emit("TotalTrC", TrCount)

      var downloadTimer1 = setInterval(function(){
       if(timeleft>0)
       {
        const CheckGname=GNames[Math.floor(Math.random() * GNames.length)];
        const CheckUname=Unames[Math.floor(Math.random() * Unames.length)]
        socketIO.emit("GNames", CheckGname)
        socketIO.emit("Unames", CheckUname)
       }
       else
       {
        clearInterval(downloadTimer1);
       }
      }, 500);
     //test();
      
    }
  }

  if(timeleft<=20)
   {
    socketIO.emit("GameFin", "Finish")
   }
   
    timeleft -= 1;
  }, 1000);

}
}




var GameStatus;

socketIO.on('connection', (socket) => {

 

  

 


     
    
    

    
        socket.on("addcoin", data => {
            if(timeleft>=0)
            {
                if(data.Type=="Dr")
                {
                    DrCount=DrCount+data.chipValue;
                    
                }
                if(data.Type=="Ti")
                {
                    TiCount=TiCount+data.chipValue;
                    
                }
                if(data.Type=="Tr")
                {
                    TrCount=TrCount+data.chipValue;
                    
                }
                if(data.Type=="DrB")
                {
                    DrCount=DrCount+2365;
                    DrCountBot=DrCountBot+2365;
                    UpdateBot(data.chipValue);
                }
                if(data.Type=="TiB")
                {
                    TiCount=TiCount+2016;
                    TiCountBot=TiCountBot+2016;
                    UpdateBot(data.chipValue);
                }
                if(data.Type=="TrB")
                {
                    TrCount=TrCount+2106;
                    TrCountBot=TrCountBot+2106;
                    UpdateBot(data.chipValue);
                }
            
          
            }
            
          })

         
          
            
          
    

    console.log(`⚡: ${socket.id} user just connected!`) 
    Count++;
    console.log(Count); 
    socketIO.emit("GetCount",300+Count);
   
    socket.on("message", data => {
      socketIO.emit("messageResponse", data)
    })

    socket.on("typing", data => (
      socket.broadcast.emit("typingResponse", data)
    ))

    socket.on("newUser", data => {
      users.push(data)
      socketIO.emit("newUserResponse", users)
      
    })
 
    socket.on('disconnect', () => {
      console.log('🔥: A user disconnected');
      users = users.filter(user => user.socketID !== socket.id)
      socketIO.emit("newUserResponse", users)
      socket.disconnect()
    });
});



 



app.get("/api", (req, res) => {
  res.json({message: "Hello"})
});

   
http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
   
    server();
      
    
});

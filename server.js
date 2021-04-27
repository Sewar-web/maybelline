'use strict';

require('dotenv').config();
const express = require('express');
const server = express();

const methodOverride = require('method-override');
const pg = require('pg');
const superagent = require('superagent');
const cors = require('cors');

// server.use(cors());

server.use(methodOverride('_method'));
// server.use(express.static('./public'));
server.set('view engine', 'ejs');
const client = new pg.Client(process.env.DATABASE_URL);
// server.use(express.urlencoded({ extended: true }));
const PORT=process.env.PORT || 3000;
//////////////////////////////////////////////////////////

server.get('/' ,homehandled)
function homehandled(req ,res)
{
    let name=req.query.meak;
    let from=req.query.rangefrom;
    let to=req.query.rangeto;
    let URL=`http://makeup-api.herokuapp.com/api/v1/products.json?brand=${name}&price_greater_than=${from}&price_less_than=${to}`;
    // console.log(URL);
    
    superagent.get(URL)
    .then(result => {
       res.render('pages/index' ,{data:result.body});
    //  res.send('result');
      });
      
}


//////////////////////////////////////////////
server.get('/product' ,producthandled)
function producthandled(req ,res)
{
  let url=`http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline`;
  superagent.get(url)
  .then(result => {
    // console.log(result.body);
    let data=result.body.map(val => {
      return new Product(val);
    })
    res.render('pages/maybelenproduct' ,{info:data})
  })
}

function Product(data)
{
  this.name=data.name;
  this.price=data.price
  this.image=data.image_link;
  this.description=data.description;
}

////////////////////////////////////////////////////////////////////
server.get('/mycard' ,cardhandled)
function cardhandled(req ,res)
{

let{name ,price ,image ,description}=req.query;
let SQL=`INSERT INTO makeup (name ,price ,image ,description)
VALUES($1, $2, $3, $4) RETURNING *;`;
let savevalue=[name ,price ,image ,description]

  client.query(SQL ,savevalue)
  .then(result => {
  res.redirect(`/card`); 
        });
}


server.get('/card' ,dcardhandled)
function dcardhandled(req ,res)
{
  let SQL= `SELECT * FROM makeup ;`;
  client.query(SQL ,save)
  .then(result => {
    res.render('pages/mycards' ,{data:result.rows});
  })

}

///////////////////////////////////////////////////////
server.get('/details/:id' ,detailshandled)
function detailshandled(req ,res)
{
  
  let SQL= `SELECT * FROM makeup WHERE id=$1`
  let save=[ req.params.id];
  client.query(SQL ,save)
  .then(result => {
    res.render('pages/details' ,{data:result.rows[0]});
  })

}

//////////////////////////////////////////////////////////////////

server.get('/updata/:id' ,updatedhandled)
function updatedhandled(req ,res)
{
  let{name ,price ,image ,description}=req.query;
let SQL=`UPDATE  makeup SET name=$1 ,price=$2 ,image=$3 ,description$4 WHERE ID=$5;`;
let savevalue=[name ,price ,image ,description ,req.params.id]

client.query(SQL ,savevalue)
.then(result =>{
  res.redirect(`/details/${req.params.id}`);
});

}

server.get('/delete/:id' ,delhandled)
function delhandled(req ,res)
{
  let sql=`DELETE FROM makeup WHERE id=$1;`;
  let save=[req.params.id];
  client.query(sql ,save)
  .then(result => {
    res.redirect(`pages/mycards${req.params.id}`);
  })
}

















server.get('*',(req,res)=>{
    res.send('There Somthing Error');
  });
  
  client.connect()
    .then( () => {
      server.listen( PORT, ()=>{
        console.log( `listening on PORT ${PORT}` );
      } );
    } );
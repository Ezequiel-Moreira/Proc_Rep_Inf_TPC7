/*jshint esversion: 6 */

var express = require('express')
var http = require('http')
var logger = require('morgan')
var pug = require('pug')
var fs = require('fs')
var formidable = require('formidable')
var jsonfile = require('jsonfile')
var url = require('url')

var app = express()

var porta=7000
var bd = "data/registo.json"

app.use(logger('combined'))


app.get('/',(req,res,next)=>{
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'})
  jsonfile.readFile(bd,(erro,registo)=>{
    if(!erro){
      res.write(pug.renderFile('views/principal.pug', {lista : registo}))
    }else{
      res.write(pug.renderFile('views/erro.pug', {e : erro}))
    }
    res.end()    
  })
})

app.get('/ficheiros/*',(req,res)=>{

  var parsedUrl = url.parse(req.url,true)
  var pathname = parsedUrl.pathname
  var ficheiro = pathname.split('/')[2]

  fs.readFile("./data/uploaded/" + ficheiro,(erro,file)=>{
    if(erro){ 
      console.log(erro)
    }else{
      res.write(file)
      res.end()
    }
  })
  
})

app.post('/processaForm',(req,res,next)=>{
  var form = new formidable.IncomingForm()
  form.parse(req,(erro,fields,files)=>{
      
    var fenviado = files.ficheiro.path
    var fnovo = './data/uploaded/' + files.ficheiro.name

    fs.rename(fenviado,fnovo,(erro)=>{
      if(!erro){
        fields.status = "Ficheiro recibido e guardado com sucesso."
        fields.ficheiro = files.ficheiro.name


        var addToRegisto = {}

        addToRegisto.nome = files.ficheiro.name
        addToRegisto.desc = fields.desc

        jsonfile.readFile(bd,(erro,registos)=>{
          if(!erro){
            registos.push(addToRegisto)

            jsonfile.writeFile(bd,registos,(erro2)=>{
              if(!erro2){
                console.log('registo guardado com sucesso!')
                next(res)
              }
              else{
                console.log('Erro:' + erro2)
              }
            })
          }else{
            console.log('Erro: ' + erro)
          }
        })
      }else{
        res.write(pug.renderFile('erro,pug',{e: 'Erro a guardar ficheiro' + erro}))
        res.end()
      }
    })

    res.redirect('/')
  })

})

app.get('/w3.css',(req,res)=>{
  res.writeHead(200,{'Content-Type':'text/css'})
  fs.readFile('stylesheet/w3.css',(erro,dados)=>{
    if(erro){
      res.write(pug.renderFile('erro.pug',{e : erro}))
    }else{
      res.write(dados)
    }
    res.end()
  })
})

http.createServer(app).listen(porta)

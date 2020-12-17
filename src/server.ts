import App from './app'

import bodyParser from 'body-parser'
import cors from 'cors'

import TokenController from './controllers/token.controller'

import connect from './connect'

const app = new App({
    port: 5000,
    controllers: [
        new TokenController(),
    ],
    middleWares: [
        bodyParser.json(),
        bodyParser.urlencoded({ extended: true }),
        cors()
    ]
})

connect('mongodb://mongoadmin:secret@localhost:27017')

app.listen()
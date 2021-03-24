const express = require('express');
const bodyParser= require('body-parser')
const app = express()

//импортируем моногоДБ
const MongoClient = require('mongodb').MongoClient

//подключаем свою монгоДБ, указываем строку подключения где все данные для бд и указываеи что делать при ошибке подключения и что делать если все ок
MongoClient.connect('mongodb+srv://yoda:vlad1725@cluster0.fixy1.mongodb.net/first-db?retryWrites=true&w=majority', { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to Database')//если показывает = все ок
        const db = client.db('first-bd') //переменная базы данных
        const quotesCollection = db.collection('quotes') //ссылка на колллецию данных
        app.set('view engine', 'ejs') // говорю что подключил расширешние Embedded JavaScript
        app.use(express.static('public')) // использую файлы из папки public
        app.use(bodyParser.json()) // использую бодипарсер для возможности отправки на сервер JSON файлов

        // ниже будут лежать все методы запросов к нашей базе данных
        // app.use(/* ... */)
        // app.get(/* ... */)
        // app.post(/* ... */)
        // app.listen(/* ... */)

        //делаем пост заврпос в МongoDB и кладем туда данные из формы
        app.post('/quotes', (req, res) => {
            quotesCollection.insertOne(req.body)
                .then(result => {
                    res.redirect('/')
                })
                .catch(error => console.error(error))
        })

        //делаю запрос к МongoDB в коллекцию "quotes" и полученные данные рендерю в index.ejs
        app.get('/', (req, res) => {
            db.collection('quotes').find().toArray()
                .then(results => {
                    res.render('index.ejs', { quotes: results })
                })
                .catch(error => console.error(error))

        })
        app.put('/quotes', (req, res) => {
            //обращаюсь ко всем колекшенам в quotes c помощью quotesCollection и с помощью метода findOneAndUpdate нахожу первую цитату с параметром name: 'Yoda'
            //если не нашло то не заменяет name: 'Yoda'  а добавляет новую
            // и с помощью монгоДибишного оператора $set устанавливаю цитату Дарта вейдера  которую я беру из своего же PUT запроса (данные берутся при клике
            //на кнопку в main.js
            quotesCollection.findOneAndUpdate(
                { name: 'Yoda' },
                {
                    $set: {
                        name: req.body.name,
                        quote: req.body.quote
                    }
                },
                {
                    upsert: true
                }
            )
                .then(result => {
                    res.json('Success')
                })
                .catch(error => console.error(error))
        })

        //обращаюсь ко всем колекшенам в quotes с помощью quotesCollection и с помощью метода deleteOne удаляю первую цитату с парметром name: 'Dart Vader' (он прописан в fetch запросе в main.js
        // Теперь, когда вы нажимаете кнопку удаления, браузер отправляет запрос DELETE через Fetch на наш сервер Express. Затем сервер отвечает, отправляя либо ошибку, либо сообщение.`Deleted Darth Vadar's quote`
        //если цитат c параметром name: 'Dart Vader' больше нет то result.deletedCount будет равен 0 и тогда я возвращаю сообщение 'No quote to delete'
        // если я получаю 'No quote to delete' то вывожу сообщение в div в файле index.ejs
        app.delete('/quotes', (req, res) => {
            quotesCollection.deleteOne(
                { name: req.body.name },
            )
                .then(result => {
                    if (result.deletedCount === 0) {
                        return res.json('No quote to delete')
                    }
                    res.json(`Deleted Darth Vadar's quote`)
                })
                .catch(error => console.error(error))
        })

    })
    .catch(error => console.error(error))//ловим и показываем ошибку

// Make sure you place body-parser before your CRUD handlers!
app.use(bodyParser.urlencoded({ extended: true }))

// Make sure you place body-parser before your CRUD handlers!
app.use(bodyParser.urlencoded({ extended: true }))
app.listen(3000, function() {
    console.log('listening on 3000')
})

//делаем get запрос на сервак первый аргумент это эндпоинт второй колбек что делаем с результатом (объектом который пришел - response)
// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/index.html')
//     // Note: __dirname это корневая папка в которой проект. sendFile значит отправить файл (который лежит в корне и называется индекс)
// })

//делаем post запрос на сервак первый аргумент это эндпоинт по которому сохраняться данные второй колбек что делаем с результатом (объектом)
// app.post('/quotes', (req, res) => {
//     console.log(req.body)
// })
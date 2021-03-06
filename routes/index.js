const express = require('express');
const router = express.Router();
const userCreate = "https://api.1up.health/user-management/v1/user";
const OAuth = "https://api.1up.health/fhir/oauth2/token";
const Axios = require('axios');
const clientId = "180386c0a6054462a97e819d4498ea2c";
const clientSecret = "j4UJ1rtUXqSFhe8wqxIhRiHh8m1QmCx5";
const {Parser} = require('json2csv');
const parser = new Parser();
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.post('/user', (req, res, next) => {
    let userid = req.body.userid;
    Axios.post(userCreate, {
        app_user_id: userid,
        client_id: clientId,
        client_secret: clientSecret
    }).then((response) => {
        res.json({
            Message: 'Please note down the code',
            Response: response.data
        })

    }).catch((error) => {
        console.log(error)
        res.status(400).json(error);
    })
});

router.get('/user', (req, res, next) => {
    let userid = req.body.userid;
    Axios.get(userCreate, {
        params: {
            client_id: clientId,
            client_secret: clientSecret,
            app_user_id: userid
        }
    }).then(response => {
        res.json(response.data);
    }).catch(error => {
        res.json(error)
    })
})

router.post('/accessToken', (req, res, next) => {
    let code = req.body.code;
    Axios.post(OAuth, {
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: "authorization_code"
    }).then(response => {
        res.status(201).json({
            Message: 'Please Note down the Access token and refresh token',
            Response: response.data
        });
    }).catch(error => {
        res.status(400).json(error);
    })
})

router.post('/refreshToken', (req, res, next) => {
    let refreshToken = req.body.refreshToken;
    Axios.post(OAuth, {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token"
    }).then(response => {
        res.status(201).json({
            Message: 'Please Note down the Access token and refresh token',
            Response: response.data
        });
    }).catch(error => {
        res.status(400).json(error);
    })
})

router.post('/patient', (req, res, next) => {
    let patientid = req.body.patientid;
    let accessToken = req.body.accessToken;
    let page = 0;
    let size = 0;
    let result = [];
    let url = `https://api.1up.health/fhir/dstu2/Patient/${patientid}/$everything`
    loop(url);
    function loop(url) {

        Axios.get(url, {
            headers: {'Authorization': 'bearer ' + accessToken}
        }).then(response => {
            // const csv = parser.parse(response.data.entry.resource);
            size = response.data.total;
            console.log(size)
            result.push(response.data);
            if (response.data.link) {
                console.log('url'+ response.data.link[1].url)
                loop(response.data.link[1].url);
            } else{
                console.log(result)
                res.json(result)
            }
        }).catch(error => {
            console.log(error)
        })
    }
})


module.exports = router;

// express 모듈 로드
const express = require('express')
const app = express()

// 웹 서버의 port 번호 지정
const port = 3000

//뷰 파일들의 기본 경로 설정
// __dirname: 현재 파일의 경로 
app.set('views', __dirname + '/views')
//뷰 파일의 엔진으로 어떤 것을 사용할 것인가 
app.set('view engine', 'ejs') 

// json 데이터 사용하겠단 설정
//app.use(express.json()) 옛날엔 이거 적어야 했지만 요즘은 안 적어도 됨
// extended false를 사용시 데이터를 변환하는 엔진인 querystring 모듈을 사용함(express에 내장됨)
// extended true를 사용하게 되면 데이터 변환하는 엔진 qs 모듈을 사용함 (구버전 express에는 내장되어 있지 않음)
app.use(express.urlencoded({extended:false})) // 요즘엔 true나 false 입력 안 해도 됨

// 웹 서버 시작
app.listen(port, function () {
    console.log('server start')
})

// contract의 정보가 담겨있는 Json 파일을 로드
const contract_info = require('./build/contracts/Test.json') //json 파일 경로
// json 파일에서 가져오기
const contract_abi = contract_info.abi
const contract_address = contract_info.networks['5777'].address
console.log(contract_address)

// 컨트랙트가 배포된 네트워크 등록
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'))

// 배포한 컨트랙트 주소와 abi를 이용하여 컨트랙트 로드
const smartcontract = new web3.eth.Contract(contract_abi, contract_address)


// 회원가입 페이지를 보여주는 주소 생성
app.get('/', (req, res) => {
    res.render('login.ejs')
})

// 회원가입 페이지를 보여주는 주소 생성
app.get('/signup', (req, res) => {
    res.render('signup.ejs')
})

app.post('/signup2', (req, res) => {
    //post 형태에서 데이터는 req.body.(key) 안에 존재 
    const input_id = req.body._id
    const input_pass = req.body._pass
    const input_name = req.body._name
    const input_age = req.body._age

    console.log(input_id, input_pass, input_name, input_age)

    smartcontract
    .methods
    .add_user(input_id, input_pass, input_name, input_age)
    .send({
        gas : 200000,
        // 가나슈에서 가져온 지갑 주소
        from : '0x0D4B57a809e4FCbb1d842F4a2A0bfFaFA96d34Cf'
    })
    .then(function(receipt){
        console.log(receipt)
        res.redirect('/') // 리다이렉트
    })
})

app.post('/signin', (req, res) => {
    // 유저가 보낸 데이터를 변수에 대입
    const input_id = req.body._id
    const input_pass = req.body._pass
    console.log('id: ', input_id, 'pass: ', input_pass)

    // smart contract를 이용하여 해당하는 아이디가 있는지 체크
    // 데이터가 존재한다면 유저가 입력한 password와 데이터의 password 값을 비교
    // 값이 같다면 로그인 성공
    // 그 외의 경우 로그인 실패 
    smartcontract
    .methods
    .view_user(input_id)
    .call() //호출만 하겠다 (트랜잭션 일어나지 않는 함수니까)
    .then(function (result) {
        //res.send(result)
        // result는 { '0' : password,'1' : name ,'2': age }

        // 로그인 성공 조건
        // result[0] == input_pass 그리고 result[0] != ""
        if((result[0] == input_pass) & (result[0] != '')) {
            res.render('index.ejs', {
                'name' : result[1]
            })
        } else {
            res.redirect('/')
        }
    })
})

// 유저 정보를 확인하는 페이지
app.get('/user_list', async (req, res)=>{
    // async: 블로킹 코드. 해당 함수가 실행될 때까지 기다림 +await
    // count 값을 로드
    const count = await smartcontract.methods.view_count().call()

    // 배열 값을 로드
    const user_list = await smartcontract.methods.view_list().call()

    // 배열의 데이터들을 하나씩 뽑아서 contract 안에 있는 view_info()에 넣어준다.
    // 결과값을 새로운 배열 데이터에 추가
    let result = new Array()
    for(var i=0; i<count; i++) {
        let _id = user_list[i]
        let data = await smartcontract.methods.view_user(_id).call()
        data['id'] = _id // id라는 키로 id를 저장
        result.push(data) // Json 데이터가 result 배열에 저장됨 
    }

    res.render('user_list.ejs', {
        'data' : result
    })
})
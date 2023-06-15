// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

contract Test {
    // 변수 선언
    address internal owner;
    uint internal count;

    // 구조체 선언
    struct user_info {
        string password;
        string name;
        uint8 age;
    }

    // 생성자 함수 
    constructor() {
        // msg.sender: deploy 하는 사람의 지갑 주소
        owner = msg.sender; 
        count = 0;
    }

    // mapping 데이터를 생성 = json 형태 만들기
    mapping (string => user_info) internal users;

    // 배열 생성
    string[] internal user_list;

    //구조체를 이용하여 배열을 생성
    user_info[] public user_list2;

    // modifier
    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can call function");
        _; // 언더바의 의미: 모디파이어로 합칠 함수들을 축약시켜놓은 것 
    }

    modifier increament {
        _; // 함수 먼저 실행하겠다!
        count++;
    }

    //user의 정보를 users mapping에 대입
    function add_user(string memory _id, string memory _pass, string memory _name, uint8 _age) public onlyOwner increament {
        // _id는 key 값

        // 조건주기 
        //require(msg.sender == owner, "only owner can call function");
        // ==> 위에서 만든 모디파이어 붙여주기
        
        // 매핑 데이터에 매개변수의 값들을 대입
        users[_id].password = _pass;
        users[_id].name = _name;
        users[_id].age = _age;
        // 배열 데이터에 id 값 추가
        user_list.push(_id);
    }

    // 유저의 정보를 출력하는 함수
    // 트랜잭션 발생 안 하는 함수 == gas비 청구 X
    function view_user(string memory _id) public view returns (string memory, string memory, uint8) {
        return (users[_id].password, users[_id].name, users[_id].age);
    }

    // count 값을 출력하는 함수 
    function view_count() public view returns(uint){
        return count;
    }

    // 배열 데이터를 출력하는 함수
    function view_list() public view returns(string[] memory) {
        return user_list;
    }

    // 아이디가 존재하는가? (중복체크) 함수 생성
    function check_id(string memory _id) public view returns (bool) {
        if(users[_id].age != 0) { // 솔리디티는 값이 없으면 0 리턴 (uint의 경우) 
            return false;
        } else {
            return true;
        }
    }
}
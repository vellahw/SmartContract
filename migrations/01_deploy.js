const test = artifacts.require("./Test")
// require() 안에는 컨트랙트 이름

module.exports = function(deployer) {
    deployer.deploy(test)
    .then(function(){
        console.log(test)
    })
}
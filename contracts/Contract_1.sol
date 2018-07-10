pragma solidity ^0.4.23;

contract Contract_1 {
    address private myself = msg.sender;
    uint public boxCount = 0;

    mapping(address => uint) public Money;
    mapping(uint => address) public BoxAddress;
    mapping(address => bool) public AddressBool;
    
    event refreshEvent ();

    modifier checkMyself() {
        require(myself == msg.sender);
        _;
    }

    modifier accountExist() {
        require(myself == msg.sender);
        require(AddressBool[myself]==true);
        _;
    }

    modifier accountNotExist() {
        require(myself == msg.sender);
        require(AddressBool[myself]==false);
        _;
    }

    function deposit() public accountExist {
        Money[myself] += 1;
        emit refreshEvent();
    }

    function withdraw() public accountExist {
        require(Money[myself] >= 1);
        Money[myself] -= 1;
        emit refreshEvent();
    }

    function open() public accountNotExist {
        boxCount += 1;
        BoxAddress[boxCount] = myself;
        AddressBool[myself] = true;
        Money[myself] = 5;
        emit refreshEvent();
    }

    function transfer(address target) public accountExist {
        require(AddressBool[target]==true);
        require(Money[myself] >= 1);
        Money[myself] -= 1;
        Money[target] += 1;
        emit refreshEvent();
    }
}























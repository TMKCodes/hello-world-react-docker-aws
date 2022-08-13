import React from 'react';

const HelloWolrd = () => {
    
    function sayHello() {
        alert('Hello Koodiklinikka!');
    }

    return (<button onClick={sayHello}>Click me!</button>);
}

export default HelloWolrd;
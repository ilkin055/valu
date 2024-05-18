let currencies = ["RUB", "USD", "EUR", "AZN"];
const apiKey = "fca_live_9LBhYW4At6eqnhTd5lV2PKmRkmZThVwmRqXvrWqk"
class Calculator {
    constructor(from, to, amount, rate, name) {
        if (["first", "last"].indexOf(name) != -1) {
            this.name = name;
            this.setFrom(from);
            this.setTo(to);
            this.setAmount(amount);
            this.setRate(rate);
            this.amountConst = false;
        }
        else {
            console.error("Invalid name");
        }
    }
    setFrom(newFrom) {
        if (currencies.indexOf(newFrom) != -1) {
            this.from = newFrom;
        }
        else {
            console.error("Invalid from");
        }
    }
    setTo(newTo) {
        if (currencies.indexOf(newTo) != -1) {
            this.to = newTo;
        }
        else {
            console.error("Invalid to");
        }
    }
    setAmount(newAmount) {
        if (typeof newAmount == "number") {
            this.amount = Math.round(newAmount * 10000) / 10000;
        }
        else {
            console.error("Invalid amount");
        }
    }
    setRate(newRate) {

        if (typeof newRate == "number") {
            this.rate = Math.round(newRate * 10000) / 10000;
        }
        else {
            console.error("Invalid rate (line: 87)");
        }
    }

    show() {
        let element = document.querySelector("." + this.name);
        let buttons = [...element.children[1].children];
        let input = element.children[2].children[0];
        let buttom = element.children[2].children[1];
        let clas = this.from.toLowerCase();
        buttons.forEach(item => {
            if (item.classList.contains(clas) && !item.classList.contains("selected")) {
                item.classList.add("selected");
            }
            else if (!item.classList.contains(clas) && item.classList.contains("selected")) {
                item.classList.remove("selected");
            }
        })
        if (!this.amountConst) {
            input.value = this.amount;
        }
        buttom.innerHTML = `<span>1 ${this.from}</span> = <span>${this.rate} ${this.to}</span>`;

    }

}

class Calculators {
    constructor(leftCurrency, rightCurrency, exchanges) {
        if (currencies.indexOf(leftCurrency) != -1 && currencies.indexOf(rightCurrency) != -1) {
            this.leftCurrency = leftCurrency;
            this.rightCurrency = rightCurrency;
            this.exchanges = exchanges;
            this.left = new Calculator(leftCurrency, rightCurrency, 1, this.exchanges.getExchange(leftCurrency, rightCurrency), "first");
            this.right = new Calculator(rightCurrency, leftCurrency, this.exchanges.getExchange(leftCurrency, rightCurrency), this.exchanges.getExchange(rightCurrency, leftCurrency), "last");
            this.left.show();
            this.right.show();
        }
        else {
            console.error("Invalid currency");
        }
    }

    changeLeftCurrency(newCurrency) {
        this.leftCurrency = newCurrency;
        this.left.setFrom(newCurrency);
        this.left.setAmount(this.toFrom(this.right.amount));
        this.left.setRate(this.exchanges.getExchange(this.leftCurrency, this.rightCurrency));
        
        this.right.setTo(this.leftCurrency);
        this.right.setRate(this.exchanges.getExchange(this.rightCurrency, this.leftCurrency));
        this.left.show();
        this.right.show();
    }
    
    changeRightCurrency(newCurrency) {
        this.rightCurrency = newCurrency;
        this.right.setFrom(newCurrency);
        this.right.setAmount(this.left.amount * this.exchanges.getExchange(this.leftCurrency, this.rightCurrency));
        this.right.setRate(this.exchanges.getExchange(this.rightCurrency, this.leftCurrency));

        this.left.setTo(this.rightCurrency);
        this.left.setRate(this.exchanges.getExchange(this.leftCurrency, this.rightCurrency));
        this.left.show();
        this.right.show();
    }
    
    changeLeftAmount(amount) {
        this.left.amountConst = true;
        this.left.setAmount(amount);
        this.right.setAmount(amount * this.exchanges.getExchange(this.leftCurrency, this.rightCurrency));

        this.left.show();
        this.right.show();
        this.left.amountConst = false;
    }

    changeRightAmount(amount) {
        this.right.amountConst = true;
        this.right.setAmount(amount);
        this.left.setAmount(this.toFrom(amount));

        this.left.show();
        this.right.show();
        this.right.amountConst = false;
    }

    toFrom(amount) {
        return amount * this.exchanges.getExchange(this.rightCurrency, this.leftCurrency);
    }

}


const getDatas = async () => {
    const response = await fetch(`https://api.currencyapi.com/v3/latest?apikey=${apiKey}&currencies=${currencies.join("%2C")}`);
    const data = await response.json();

    return data;
}

getDatas().then(data => {
    let usdExchanges = {};
    currencies.forEach(item => {
        usdExchanges[item] = data.data[item].value;
    })
    let exchanges = {
        usdExchanges: usdExchanges,
        getExchange(from, to) {
            if (currencies.indexOf(from) != -1 && currencies.indexOf(to) != -1) {
                return this.usdExchanges[to] / this.usdExchanges[from];
            }
            else {
                console.error("Invalid currency (line: 99)");
            }
        }
    }

    let calculators = new Calculators("RUB", "USD", exchanges);

    document.querySelector(".first .rub").addEventListener("click", () => {
        calculators.changeLeftCurrency("RUB");
    })

    document.querySelector(".first .usd").addEventListener("click", () => {
        calculators.changeLeftCurrency("USD");
    })

    document.querySelector(".first .eur").addEventListener("click", () => {
        calculators.changeLeftCurrency("EUR");
    })

    document.querySelector(".first .azn").addEventListener("click", () => {
        calculators.changeLeftCurrency("AZN");
    })

    document.querySelector(".last .rub").addEventListener("click", () => {
        calculators.changeRightCurrency("RUB");
    })

    document.querySelector(".last .usd").addEventListener("click", () => {
        calculators.changeRightCurrency("USD");
    })

    document.querySelector(".last .eur").addEventListener("click", () => {
        calculators.changeRightCurrency("EUR");
    })

    document.querySelector(".last .azn").addEventListener("click", () => {
        calculators.changeRightCurrency("AZN");
    })

    document.querySelector(".first input").addEventListener("keyup", (event) => {
        if (event.target.value.split("")[0] == "." || event.target.value.split("")[0] == "-") {
            let arr = event.target.value.split("");
            arr.shift();
            event.target.value = Number(arr.join(""));
        }
        if (event.key != ".") {
            calculators.changeLeftAmount(Number(event.target.value))
        };
    })

    document.querySelector(".last input").addEventListener("keyup", (event) => {
        if (event.target.value.split("")[0] == "." || event.target.value.split("")[0] == "-") {
            let arr = event.target.value.split("");
            arr.shift();
            event.target.value = Number(arr.join(""));
        }
        if (event.key != ".") {
            calculators.changeRightAmount(Number(event.target.value));
        }
    })

}).catch(err => {
    document.querySelector(".alert").classList.remove("display-none");
})
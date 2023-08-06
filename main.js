const imageCoins = [];
const pricesLocalArray = [];
const coinsPrices = [];
let lastSelectedCoin;

    $.getJSON('./api-images.json', (data) => {
        for(const field of data){
            imageCoins.push(field)
        }
    });

    const fnum = (x) => {
        if (x < 1000000000) {
            return((x / 1000000).toFixed(2) + "M");
        } else if (x < 1000000000000) {
            return((x / 1000000000).toFixed(2) + "B");
        }
    }

    $(document).ready( () => {
        $(".Reports").on("click", () => {
            const ReportsCoins = getReportsCoinsFromLocal();
            if(ReportsCoins.length !== 0){
                $("#mainContainer").hide();
                displayReportsCoins();
                $("#mainContainer").show();
            }else{
                $("#mainContainer").hide();
                $('#alertBox').html(`Empty reports`);
                $('#alertBox').removeAttr('hidden');
            }
        })
       
    });

    $(document).ready( () => {
        $("#cancelBtn").on("click", () => {
            hidePopup();
            const coins = getAllCoinsFromLocal();
            displayCoins(coins);
        })
    });

    $(document).ready( () => {
        $(".About").on("click", () => {
          const content =  `<div id="aboutUsDiv">
          <p id="aboutParagraph">About. At Cipher Mart, we believe that everyone should have the freedom to earn, hold, spend, share and give their money - no matter who you are or where you come from. Today, Cipher Mart is the world's leading blockchain ecosystem, with a product suite that includes the largest digital asset exchange.</p>
          <div><iframe id="iframe" src="https://www.youtube.com/embed/0ZMy96xYkh8?autoplay=1" title="YouTube video player" frameborder="0" allow="accelerometer; allow='autoplay'; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>
          </div>`
            $("#mainContainer").html(content);
        })
    });

    $(document).ready( () => {
        $(".Coins").on("click", () => {
            $.ajax({
                url: "https://api.coinpaprika.com/v1/tickers",
                success: coins => displayCoins(coins.slice(0, 100)),
                error: err => alert(err.statusText),
                });
            $('#alertBox').attr("hidden", true);
            $("#mainContainer").show();
            hidePopup()
        })
    });

    const getAllCoinsFromLocal = () => {
        const storageArray = localStorage.getItem("coins");
        if (storageArray) {
            return JSON.parse(storageArray);
        } else {
            return [];
        }
    }

    const getReportsCoinsFromLocal = () => {
        const storageArray = localStorage.getItem("ReportsCoins");
        if (storageArray) {
            return JSON.parse(storageArray);
        } else {
            return [];
        }
    }

    const getPricesCoinsFromLocal = () => {
        const storageArray = localStorage.getItem("coinsPrices");
        if (storageArray) {
            return JSON.parse(storageArray);
        } else {
            return [];
        }
    }

    const checkSwitchStatus = (id) => {
        const checkbox = $(`#${id}`);
        const isChecked = checkbox.prop('checked');
        return isChecked;
    }
 
    const handleCheckboxClick = (i, id) => {
        lastSelectedCoin = id;
        const statusInput = checkSwitchStatus(id);
        if(statusInput) {
            const coins = getAllCoinsFromLocal();
            setOneCoinToLocal(coins[i]);
            $(`#${coins[i].id}`).prop("checked", true);
        }else{
            removeOneCoinFromLocal(id);
        }
    }
       
    const setSwitchStatusOn = () => {
        setTimeout(() => {
            const ReportsCoins = getReportsCoinsFromLocal();
            $("#reports").html(`Reports (${ReportsCoins.length}/5)`);
            for(const coin of ReportsCoins){
                const id = coin.id;
                $(`#${id}`).prop("checked", true);
            }
        }, 500);
    }
    
    const setSwitchStatusOff = () => {
        setTimeout(() => {
            const coins = getAllCoinsFromLocal()
            for(const coin of coins){
                const id = coin.id;
                $(`#${id}`).prop("checked", false);
            }
        }, 200);
    }

    const removeOneCoinFromLocal = (id) => {
        const ReportsCoins = getReportsCoinsFromLocal();
        const index = ReportsCoins.findIndex(elem => elem.id === id)
        ReportsCoins.splice(index, 1);
        localStorage.setItem("ReportsCoins", JSON.stringify(ReportsCoins));
        $("#reports").html(`Reports (${ReportsCoins.length}/5)`);
    }

    const setOneCoinToLocal = (coin) => {
        const ReportsCoins = getReportsCoinsFromLocal();
        if(ReportsCoins.length < 5) {  
        for(const report of ReportsCoins){
            if(!report.image) report.image = coin.image;
        }
            ReportsCoins.push(coin);
            localStorage.setItem("ReportsCoins", JSON.stringify(ReportsCoins));
            $("#reports").html(`Reports (${ReportsCoins.length}/5)`);
        }else if(ReportsCoins.length === 5){
            displayPopUpSelectCard()
            setSwitchStatusOff()
            activatePopup()
        }
    }

    const clearAllSelectedCoins = (coins) => {
        for (let i = 0; i < coins.length; i++) {
            removeOneCoinFromLocal(coins[i].id)
        }
        setSwitchStatusOff();
    }

    const removeCoin = (i) => {
        const ReportsCoins = getReportsCoinsFromLocal();
        removeOneCoinFromLocal(ReportsCoins[i].id);
        const coins = getAllCoinsFromLocal();
        const currentCoin = coins.find(coin => coin.id === lastSelectedCoin);
        setOneCoinToLocal(currentCoin);
        displayCoins(coins);
        hidePopup();
    }

    const displayPopUpSelectCard = () => {
        const coins = getAllCoinsFromLocal();
        const ReportsCoins = getReportsCoinsFromLocal(); 
        ReportsCoins.forEach((reportCoin) => {   
        const matchingCoin = coins.find((coin) => { return coin.name === reportCoin.name });
        if (matchingCoin) reportCoin.image = matchingCoin.image; 
        });
        let content = "";
        let ul = "";
        for (let i = 0; i < ReportsCoins.length; i++) {
            ul += `<div class="listImgCoinContainer">
                <li onclick="removeCoin(${i})"><p class="pName"><img class="listImgCoin" src="${(ReportsCoins[i].image) ? ReportsCoins[i].image : "https://www.shutterstock.com/image-vector/gold-coin-dollar-sign-eps8-600w-225394369.jpg"}" alt="No image" class="ui-li-icon ui-corner-none">&nbsp;&nbsp;&nbsp;${ReportsCoins[i].symbol}</p></li>
                </div>`
        }
        content = `<div class='selectCardContainer'>
        <ul class="ulDiv" data-role="listview" data-inset="true">
            ${ul}
        </ul>
        </div>`;
            $(".cardsContainer").html(content);
    }
    const setCoinsToLocal = (coins) => {
        localStorage.setItem("coins", JSON.stringify(coins));
    }

    const displaySelectedCoin = (coin, i) => {
        const card = `  <div class='cardContainer'>
                        <div class='header'>
                        <div class='imgContainer'>
                        <h5>${coin.symbol}</h5>
                        <h5>${coin.name}</h5>
                        <img class='imgCoin' src=${(coin.image) ? coin.image : "https://www.shutterstock.com/image-vector/gold-coin-dollar-sign-eps8-600w-225394369.jpg"} alt="No image" />
                        </div>
                        </div>
                        <div class='content'>
                        <div>
                        <p class='title'>Last Price: <span class="value">${(coin.quotes.USD.price).toFixed(2)}$</span></p>
                        </div>
                        <div>
                        <p class='title'>Change 24h: <span class="value">${(coin.quotes.USD.volume_24h_change_24h).toFixed(2)}%</span></p>
                        </div>
                        <div>
                        <p class='title'>Market Cap: <span class="value">${fnum(coin.quotes.USD.market_cap)}</span></p>
                        </div>
                        <div hidden id="${coin.symbol}">
                        <p class='title'>USD: <span class="value">${(coin.quotes.USD.price).toFixed(2)}$</span></p>
                        <p class='title'>ILS: <span class="value">${((coin.quotes.USD.price)*3.617).toFixed(2)}&#8362;</span></p>
                        <p class='title'>EUR: <span class="value">${((coin.quotes.USD.price)*0.90).toFixed(2)}&euro;</span></p>
                        </div>
                        <div id="btnContainer">
                        <button type="button" id=${i} onclick="dropDown(${coin.symbol}, ${i})" class="btn btn-outline-info">More Info</button>
                        </div>
                        </div>
                        </div>  `;
        $("#mainContainer").html(card);
    }

    const getSearchInputValue = () => {
        const coins = getAllCoinsFromLocal();
        const value = $('#searchInput').val();
                for (let i = 0; i < coins.length; i++) {
                    if((coins[i].symbol.toLowerCase() === value.toLowerCase()) || (coins[i].name.toLowerCase() === value.toLowerCase())){
                        $('#alertBox').attr("hidden", true);
                        displaySelectedCoin(coins[i], i);
                        return;
                    }
                }
                for (let i = 0; i < coins.length; i++) {
                    if((coins[i].symbol.toLowerCase() !== value.toLowerCase()) || (coins[i].name.toLowerCase() !== value.toLowerCase())){
                        if(value === "") {
                            $('#alertBox').attr("hidden", true);
                            displayCoins(coins);
                            return;
                        }
                        $('#searchInput').val("");
                        $('#alertBox').html(`${value} coin is not exist`);
                        $('#alertBox').removeAttr('hidden');
                        return;
                    }
                }
    }

    const removePricesFromLocalStorage = () => {
        const coinsPrJson = localStorage.getItem("coinsPrices");
        const coinsPr = JSON.parse(coinsPrJson);
        coinsPr.splice(0, 1);
        const jsonPrices = JSON.stringify(coinsPr);
        localStorage.setItem("coinsPrices", jsonPrices);
    }

    const displayPriceCoin = (coin, i) => {
        const usdCoin = coin.quotes.USD.price.toFixed(2);
        const ilsCoin = ((coin.quotes.USD.price)*3.617).toFixed(2);
        const eurCoin = ((coin.quotes.USD.price)*0.91).toFixed(2);
        const priceCoin = {
            symbol: coin.symbol,
            usd: usdCoin,
            ils: ilsCoin,
            eur: eurCoin
        };
        const coinsPrices = getPricesCoinsFromLocal();
        coinsPrices.push(priceCoin);
        const coinPriceJson = JSON.stringify(coinsPrices);
        localStorage.setItem("coinsPrices", coinPriceJson);
        setTimeout(() => {
            removePricesFromLocalStorage();
        }, 120000);
        
            $(`#${i}USD`).html(`${coin.quotes.USD.price.toFixed(2)}$`);
            $(`#${i}ILS`).html(`${((coin.quotes.USD.price)*3.617).toFixed(2)}&#8362;`)
            $(`#${i}EUR`).html(`${((coin.quotes.USD.price)*0.90).toFixed(2)}&euro;`)
        }

    const dropDown = (coins, index) => {
    if ($(`#${coins.id}`).is(":hidden")) {
        $(`#${coins.id}`).removeAttr('hidden');
        $(`#${index}`).html("Less Info");
        $.ajax({
            url: "https://api.coinpaprika.com/v1/tickers",
            success: coins => displayPriceCoin(coins[index], index),
            error: err => alert(err.statusText)
        });
       
    }else{
        $(`#${coins.id}`).attr("hidden", true);
        $(`#${index}`).html("More Info");
    }
    }

    const activatePopup = () => {
        $('.popUpcontent').show();
        $('html,body').scrollTop(0);
    }

    const hidePopup = () => {
        $('.popUpcontent').hide();
    }

    $(document).ready(() => {
        $('#activatePopupBtn').on('click', activatePopup);
    });

    const displayReportsCoins = () => {
        const ReportsCoins = getReportsCoinsFromLocal();
        let content = "";
        for (let i = 0; i < ReportsCoins.length; i++) {
            const card = ` <div class='cardContainer'>
            <div class='header'>
            <div class='imgContainer'>
            <h5>${ReportsCoins[i].symbol}</h5>
            <h5>${ReportsCoins[i].name}</h5>
            <img class='imgCoin' src=${(ReportsCoins[i].image) ? ReportsCoins[i].image : "https://www.shutterstock.com/image-vector/gold-coin-dollar-sign-eps8-600w-225394369.jpg"} alt="No image" />
            </div>
            </div>
            <div class='content'>
            <div>
            <p class='title'>Last Price: <span class="value">${(ReportsCoins[i].quotes.USD.price).toFixed(2)}$</span></p>
            </div>
            <div>
            <p class='title'>Change 24h: <span class="value">${(ReportsCoins[i].quotes.USD.volume_24h_change_24h).toFixed(2)}%</span></p>
            </div>
            <div>
            <p class='title'>Market Cap: <span class="value">${fnum(ReportsCoins[i].quotes.USD.market_cap)}</span></p>
            </div>
            <div hidden id="${ReportsCoins[i].symbol}">
            <p class='title'>USD: <span class="value">${(ReportsCoins[i].quotes.USD.price).toFixed(2)}$</span></p>
            <p class='title'>ILS: <span class="value">${((ReportsCoins[i].quotes.USD.price)*3.617).toFixed(2)}&#8362;</span></p>
            <p class='title'>EUR: <span class="value">${((ReportsCoins[i].quotes.USD.price)*0.91).toFixed(2)}&euro;</span></p>
            </div>
            <div id="btnContainer">
            <button type="button" id=${i} onclick="dropDown(${ReportsCoins[i].symbol}, ${i})" class="btn btn-outline-info">More Info</button>
            </div>
            </div>
            </div>  `;
            content += card;
            $("#mainContainer").html(content);
        }
    }

    const displayCoins = (coins) => {
        setSwitchStatusOn();
        for (let i = 0; i < coins.length; i++) {
            for (let j = 0; j < imageCoins.length; j++) {
                if(coins[i].name === imageCoins[j].name) {
                    coins[i].image = imageCoins[j].image;
                }
            }
        }
        setCoinsToLocal(coins);
        let content = "";
        for (let i = 0; i < coins.length; i++) {
            const card = ` <div class='cardContainer'>
            <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" onclick="handleCheckboxClick(${i}, id)" role="switch" id="${coins[i].id}">
            </div>
            <div class='header'>
            <div class='imgContainer'>
            <h5>${coins[i].symbol}</h5>
            <h5>${coins[i].name}</h5>
            <img class='imgCoin' src=${(coins[i].image) ? coins[i].image : "https://www.shutterstock.com/image-vector/gold-coin-dollar-sign-eps8-600w-225394369.jpg"} alt="No image" />
            </div>
            </div>
            <div class='content'>
            <div>
            <p class='title'>Last Price: <span class="value">${(coins[i].quotes.USD.price).toFixed(2)}$</span></p>
            </div>
            <div>
            <p class='title'>Change 24h: <span class="value">${(coins[i].quotes.USD.volume_24h_change_24h).toFixed(2)}%</span></p>
            </div>
            <div>
            <p class='title'>Market Cap: <span class="value">${fnum(coins[i].quotes.USD.market_cap)}</span></p>
            </div>
            <div hidden id="${coins[i].symbol}">
            <p class='title'>USD: <span id="${i}USD" class="value"></span></p>
            <p class='title'>ILS: <span id="${i}ILS" class="value"></span></p>
            <p class='title'>EUR: <span id="${i}EUR" class="value"></span></p>
            </div>
            <div id="btnContainer">
            <button type="button" id=${i} onclick="dropDown(${coins[i].symbol}, ${i})" class="btn btn-outline-info">More Info</button>
            </div>
            </div>
            </div>  `;
            content += card;
            $("#mainContainer").html(content);
        }
    }
    
    $.ajax({
        url: "https://api.coinpaprika.com/v1/tickers",
        success: coins => displayCoins(coins.slice(0, 100)),
        error: err => alert(err.statusText),
    });
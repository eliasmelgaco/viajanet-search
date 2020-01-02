async function main() {
    var nodemailer = require('nodemailer');
    var webdriver = require("selenium-webdriver"),
    By = webdriver.By,
    // mUtil = webdriver.until;
    // mUrl = "https://www.viajanet.com.br/busca/passagens/md#/GRU,YYZ,YYC,YYZ/YYZ,YYC,YYZ,GRU/MD/02-03-2019,03-03-2019,19-04-2019,19-04-2019/2/0/0/-/-/",
    mUrl = 'https://www.viajanet.com.br/busca/passagens/voos#/GRU/YYC/RT/02-03-2019/19-04-2019/-/-/-/2/0/0/-/-/-/-',
    mSleepTime = 300000,
    chrome = require('selenium-webdriver/chrome'),
    options = new chrome.Options().headless(),
    valorPassagem = 6500;
​
    // console.log('iniciei a busca')
    var mDriver = new webdriver.Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    await mDriver.get(mUrl);
    let jaEnviei = false;
    let deuCerto = false;
    let precoImprimir = '';
    let entreiPreco = false;
    await mDriver.sleep(mDriver.findElements(By.className("price ng-binding")).then(async function(elements){
        // console.log('carregou a busca');
        deuCerto = true;
        // console.log('entrei aqui 1');
        await elements.forEach(async function (element) {
            // console.log('entrei aqui 2');
            let foi = false;
            await element.getText().then(async function(text){
                if (precoImprimir === '') {
                    precoImprimir = text;
                }
                if (text !== '' && !foi) {
                    console.log(text);
                    foi = true;
                }
                // console.log('entrei aqui 3');
                let valor = text.replace('R$ ', '').replace('.', '');
                let preco = parseFloat(valor);
                if (preco < valorPassagem && !jaEnviei) {
                    let dataAchei = new Date();
                    let horarioAchei = `${dataAchei.getDate()}/${dataAchei.getMonth()}/${dataAchei.getFullYear()} ${dataAchei.getHours()}:${dataAchei.getMinutes()}`;
                    console.log(`Achei: preço ${preco}. ${horarioAchei}`);
                    var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: '', // colocaEmailAqui
                        pass: '' // colocarPasswordAqui
                    }
                    });
​
                    var mailOptions = {
                        from: '', // seu email aqui
                        to: '', // seu email aqui
                        subject: 'Preço ViajaNet',
                        html: `
                            <html>
                                <a>Preço ${preco}</a><br>
                                <a>${horarioAchei}</a>
                                <a href=${mUrl} target="_blank">Comprar</a>
                            </html>
                        `
                    };
​
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                    jaEnviei = true;
                    // console.log(`jaenviou? ${jaEnviei}`);
                    if (jaEnviei) {
                        setTimeout(() => {
                            // console.log('enviei o email');
                            mDriver.quit();
                            main();
                        }, mSleepTime);
                    }
                }
                // console.log('entrei aqui 4');
            });
        });
        if (!entreiPreco) {
            entreiPreco = true;
            let dataFinalizei = new Date();
            let horarioFinalizei = `${dataFinalizei.getDate()}/${dataFinalizei.getMonth()}/${dataFinalizei.getFullYear()} ${dataFinalizei.getHours()}:${dataFinalizei.getMinutes()}`;
            console.log(`finalizei a busca, aguardando 5min, hora: ${horarioFinalizei}, valor atual: ${precoImprimir}`);
        }
    }).catch(async () => {
        setTimeout(() => {
            // console.log('entrei no catch')
            mDriver.quit();
            main();
        }, mSleepTime);
    }));
    setTimeout(() => {
        // console.log('tentar novamente')
        mDriver.quit();
        main();
    }, mSleepTime);
}
main();

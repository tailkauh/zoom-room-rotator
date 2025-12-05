/**
 * Breakout huoneiden vaihtamisen automatisointi Zoom web clientissä.
 * 
 * Esimerkkejä:
 * 
 * Aloita kiertämään huoneita 1-10 järjestyksessä vaihtaen huonetta 20 sekunnin välein:
 *      BreakoutRoomRotator.createAndStartLinear(1, 10, 20);
 * 
 * Siirry huoneeseen 3:
 *      BreakouRoomRotator.join(3); 
 */


/* TODO Käyttöliittymän tekeminen
    painikekäyttöliittymä
    - kannattaa lisätä painikkeet esim olemassa olevaan footer-elementtiin
    - näkymä pitää luoda uudestaan breakoutroomin vaihtamisen jälkeen
    - päädokumentin bodyn zindex on 30 000
    - näkyviä elementtejä tällä css:llä:
    
    background: red;
    z-index: 40000;
    position: absolute;
    width: 100px;
    height: 100px;
    top: 0px;
    left: 0px;
    
    käyttöliittymä pitäisi luoda joka kerta uudelleen
    const kayttoliittyma = document.createElement("div");
    kayttoliittyma.style = "z-index:9999;width:20px;height:20px;background:grey;position:absolute;"
    kayttoliittyma.vipu = 0;
    kayttoliittyma.addEventListener("click", (e)=> {
        if (kayttoliittyma.vipu === 1) {
            stopRotation();
  	        kayttoliittyma.style.backgroundColor = "grey";
            kayttoliittyma.vipu = 0;
        } else {
            startRotation();
            kayttoliittyma.style.backgroundColor = "red";
            kayttoliittyma.vipu = 1;
        }
        });
    document.getElementById("foot-bar").appendChild(kayttoliittyma);     
*/

/* TODO Zoom Web Client käyttöliittymälle välipalikka
    -[ ] nykyisen huoneen kysyminen
    -[ ] huoneiden tietojen kysyminen
    -[ ] painikkeiden painaminen???
*/

"use strict";

/**
 * Luokka jonka oliot kiertelevät Breakout-huoneissa Zoom web clientissä.
 * TODO
 *  -[ ] kiertämisen pausetus/jatkaminen
 *  -[ ] nykyiseen huoneeseen liittymisen estäminen
 *  -[ ] huoneeseen liittymisen virheenkäsittely
 *  -[ ] tyhjän huoneen skippaaminen
 *  -[ ] huoneiden tietojen hakeminen
 *  -[ ] join confirm käsittelijän kutsu painikkeiden painamisen sijasa (onko edes mahdollista) 
 */
class BreakoutRoomRotator {

    current; // TODO korjaa etsimään nykyinen kunnolla
    next;
    first = 1;
    last = 100;
    interval = 50;
    approach = "linear";
    rooms = [];


    /**
     * Aloitetaan kiertäminen alusta
     * @param {Number} firstRoom ensimmäisen huoneen numero
     * @param {Number} lastRoom viimeisen huoneen numero
     * @param {Number} secondsInRoom huoneenvaihtoväli sekunteina
     */
    start(firstRoom = this.first, lastRoom = this.last, secondsInRoom = this.interval) {
        this.setRoomRange(firstRoom, lastRoom);
        this.current = undefined;
        this.interval = secondsInRoom;
        const rotate = () => {
            if (this.rooms.length == 0) {
                this.setRoomRange(this.first, this.last);
            } 
            BreakoutRoomRotator.join(pickOne(this.rooms, this.approach));
        }

        // kiertämisen aloitus
        Ajastin.alusta();
        Ajastin.repeat(rotate, this.interval);
    }


    /**
     * Liittyy annettuun breakout-huoneeseen Zoomin web versiossa
     * @param {Number} breakoutRoomNumber 
     */
    static join(breakoutRoomNumber) {
        const wcWindow = document.getElementById("webclient")?.contentWindow;
        const wcDocument = wcWindow.document;
        const number = Number(breakoutRoomNumber);

        // painikkeiden jono
        // Onko pakko painella koko painikkeiden ketju????
        // TODO Room x button painamista ennen tarkistettava onko huoneessa osallistujia ja tarkistettava se mikä on nykyinen huone
        const selectorQueue = ["#moreButton button", "a.dropdown-item[aria-label=\"Breakout Rooms\"]", `[aria-label^=\"Room ${number}:\"] button`, ".confirm-tip button"];
        Clicker.execute(selectorQueue, wcDocument.body);
    }


    /**
     * Asetetaan olion huoneet välin perusteella
     * @param {Number} first ensimmäisen huoneen numero
     * @param {Number} last viimeisen huoneen numero
     */
    setRoomRange(first, last) {
        this.first = first;
        this.last = last;
        this.rooms = intRange(first, last);
    }


    /**
     * Luodaan ja käynnistetään annetun välin huoneita järjestyksessä kiertävä olio.
     * @param {Number} startRoom ensimmäisen huoneen numero
     * @param {Number} endRoom viimeisen huoneen numero
     * @param {Number} secondsInRoom huoneenvaihtoväli sekunteina
     * @returns luotu kiertäjäolio
     */
    static createAndStartLinear(startRoom, endRoom, secondsInRoom=60) {
        const rotator = new BreakoutRoomRotator();
        rotator.start(startRoom, endRoom, secondsInRoom);
        return rotator;
    }


    /**
     * Luodaan ja käynnistetään annetun välin huoneita satunnaisesti kiertävä olio.
     * Kaikkissa huoneissa vieraillaan kerran ennen toisten vierailujen aloittamista.
     * @param {Number} startRoom ensimmäisen huoneen numero
     * @param {Number} endRoom viimeisen huonenn numero
     * @param {Number} secondsInRoom huoneenvaihtoväli sekunteina
     * @returns luotu kiertäjäolio
     */
    static createAndStartRandom(startRoom, endRoom, secondsInRoom=60) {
        const rotator = new BreakoutRoomRotator();
        rotator.approach = "random";
        rotator.start(startRoom, endRoom, secondsInRoom);
        return rotator;
    }

    /**
     * Lisätään painikkeet näkyviin Zoom web clientin painikepalkkiin
     * TODO:
     * - painikkeen toiminnallisuus
     * - css säätäminen
     */
    static createUI() {
        const wcWindow = document.getElementById("webclient")?.contentWindow;
        const wcDocument = wcWindow.document;
        const footBarDiv = wcDocument.querySelector("#foot-bar");

        //div jossa painikkeet
        const div = wcDocument.createElement("div");
        div.id = "roomRotatorUi";
        div.style.padding = "1em";
        div.style.border = "white 1px solid";
        div.style.display = "flex";

        // start/pause painike
        const playPauseBtn = wcDocument.createElement("button");
        const playText = "Kiertele huoneita";
        const pauseText = "Keskeytä"
        playPauseBtn.innerText = "Kiertele huoneita"; 
        playPauseBtn.style.color = "white";
        playPauseBtn.style.padding = "0.25em";
        playPauseBtn.style.border = "white 1px solid";

        const iconDiv = wcDocument.createElement("div");
        iconDiv.id = "iconDiv";
        const iconSvg = `<svg height="3em" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="12" fill="white"/>
            <circle cx="80" cy="40" r="12" fill="white"/>
            <circle cx="40" cy="80" r="12" fill="white"/>
            <circle cx="80" cy="80" r="12" fill="red"/>
        </svg>
        `;
        iconDiv.innerHTML = iconSvg;
        const icon = iconDiv.children[0];
    
        const rotateStyle = wcDocument.createElement("style");
        rotateStyle.textContent = 
            `@keyframes quarterEase {
                0% {
                  transform: rotate(0deg);
                  animation-timing-function: ease-in-out;
                }
                25% {
                  transform: rotate(90deg);
                  animation-timing-function: ease-in-out;
                }
                50% {
                  transform: rotate(180deg);
                  animation-timing-function: ease-in-out;
                }
                75% {
                  transform: rotate(270deg);
                  animation-timing-function: ease-in-out;
                }
                100% {
                  transform: rotate(360deg);
                }
        }`;
        wcDocument.head.appendChild(rotateStyle);

        playPauseBtn.addEventListener("click", e => {
            const text = playPauseBtn.innerText;
            if (text === playText) {
                playPauseBtn.innerText = pauseText;
                playPauseBtn.style.border = "red 1px solid";
                icon.style.animation = "quarterEase 4s infinite forwards";



            } else {
                playPauseBtn.innerText = playText;
                playPauseBtn.style.border = "white 1px solid";
                icon.style.animation = "";
            }
        });
        
        div.append(iconDiv);
        div.append(playPauseBtn);
        footBarDiv.append(div);
    }
}



/**
 * Sekunnin välein toimiva simppeli ajastin, joka suorittaa tehtävälistan tehtäviä.
 * TODO ajastin
 *  -[ ] ajastettujen tehtävien tunnisteet ja hienojakoisempi hallinta esim. yksittäisen tehtävän pausetus tai poistaminen
 *  -[ ] tehtävän countdown loki päälle/pois
 */
class Ajastin {

    static #alustettu = false;
    static #todoList = [];
    static #taskId = 0;
    static logging = true;


    /**
     * Luodaan div-elementti ja sille CSS-animaatio ja animaation tapahtumankuuntelija ajankulun mittaamiseksi.
     * setInterval ja requestAnimationFrame en saanut toimimaan ajastamiseen Zoom web clientin kanssa.
     */
    static alusta(force=false) {
        if (!force && Ajastin.#alustettu) //TODO miten alustamisen kanssa kannattaisi tehdä?
            return;
        // "animaatio", jolla ajanotto ajastimelle
        const style = document.createElement("style");
        style.textContent = "@keyframes tick { from {opacity: 1;} to {opacity: 1;} }";
        document.head.appendChild(style);

        const ajastin = document.createElement("div");
        ajastin.id = "ajastin";
        ajastin.style.width = ajastin.style.height = "0px";
        ajastin.style.animation = "tick 1s infinite";
        document.body.appendChild(ajastin);

        ajastin.addEventListener("animationiteration", Ajastin.#tick);
        Ajastin.#alustettu = true;
    }


    /**
     * Sekunnin välein tutkitaan ja suoritetaan tarvittaessa tehtävälistan tehtävät.
     * Tyhjennetään toteutuneet tehtävät.
     * @param {Event} _ ei käytössä 
     */
    static #tick(_) {
        // käydään tehtävät läpi ja poistetaan turhat listasta
        const t = Ajastin.#todoList;
        let j = t.length-1;
        for (let i = j; i >= 0; i--) {
            const todo = t[i];
            const logging = Ajastin.logging && todo.logging;
            if (todo.freeze) { // keskeytetylle ei tehdä mitään
                logging && console.log(`task "${todo.id}" is paused at ${todo.elapsed} elapsed seconds.`);
                continue;
            }

            todo.elapsed++;
            if (todo.elapsed % todo.interval == 0) { // onko aika suorittaa tehtävä
                logging && console.log(`task "${todo.id}" was executed at ${todo.elapsed} elapsed seconds.`);
                todo.task();
                todo.times--;
            } else {
                logging && console.log(`task "${todo.id}" is at ${todo.elapsed} elapsed seconds.`);
            }
            if (todo.times < 1) { // onko suorituskerrat täyttyneet
                t[i] = t[j--];
                t.pop();
            }
        }
    }


    /**
     * Lisää tehtävälle id:n.
     * Lisätään tehtävä suoritettavien tehtävien joukkoon.
     * @param {Object} todo
     * @returns tehtävän id
     */
    static #register(todo) {
        const uusiId = Ajastin.#taskId++;
        todo.id = uusiId;
        Ajastin.#todoList.push(todo);
        return uusiId;        
    }
    

    /**
     * Lisätään toistuva tehtävä.
     * Suoritetaan ensimmäinen toisto.
     * @param {Function} task ajastettava tehtävä/funcktio
     * @param {Number} interval kuinka tiuhaan tehtävä suoritetaan (sekuntej)
     * @param {Number} times kuinka monta kertaa tehtävää tehdään
     * @returns ajastettavan tehtävän 
     */
    static repeat(task, interval, times=Number.POSITIVE_INFINITY) {
        task();

        // objektiksi, jolla ajastamiseen liittyviä lisätietoja
        const todo = {
            id: -1, // tunniste
            task: task, // suoritettava funktio
            elapsed: 0, // lasketaan sekunteja aktiivisena (ei-jäädytettynä)
            interval: interval, // kuinka monen sekunnin välein suoritetaan
            times: times - 1, // suorituskerrat, suoritettu ensimmäisen kerran heti äsken
            freeze: false,  // onko jäädytetty/keskeytetty
            logging: true
        }
        
        return Ajastin.#register(todo);
    }

    
    /**
     * Tyhjennetään tehtävälista
     */
    static clear() {
        Ajastin.#todoList = [];
    }

    static getList() {
        return Ajastin.#todoList;
    }


    /**
     * Palauttaa tehtävä-olion id:n perusteella
     * @param {Number} taskId etsittävän tehtävän id 
     * @returns löydetty olio tai undefined
     */
    static findTask(taskId) {
        return Ajastin.#todoList.find(todo => todo.id == taskId);
    }


    /**
     * Tehtävän keskeyttäminen/jatkaminen
     * @param {Number} taskId tehtävän id
     */
    static togglePause(taskId) {
        const todo = Ajastin.findTask(taskId);
        todo.freeze = !todo.freeze; 
    }
}


/**
 * Osaa klikkailla järjestyksessä annetujen selectorien perusteella haettavia elementtejä.
 * Oletetaan että klikkauksen jälkeen DOM-puuhun lisätään seuraavaksi klikattava elementti.
 * TODO
 *  -[ ] ei toimi jos klikkailtavat asiat valmiiksi DOM-puussa
 */
class Clicker {
    static execute = Clicker.#executeWaitMutation;

    /**
     * Lähetetään tapahtuma kohde-elementille
     * new MouseEvent("click", {bubbles: true, cancelable: true, button: 0} taitaa vastata click() aika pitkälti
     * @param {EventTarget} target kohde-elementti
     */
    static #process(target) {
        const event = new MouseEvent("click", {bubbles: true, cancelable: true, button: 0});
        target.dispatchEvent(event);
    }

    /**
     * Ensimmäisen oletetaan löytyvän observationTarget alaisesta DOM-puusta ilman odottelua.
     * Aloitetaan käsittelyn ketju.
     * @param {Array} selectorSequence käsiteltävien elementtien selectorien jono
     * @param {Node} observationTarget käsittelyn jälkeen tarkkailtava DOM-puun juuri ja puu josta selectoreilla etsitään
     */
    static #executeWaitMutation(selectorSequence, observationTarget) {
        const seq = selectorSequence; 
        let i = 0;
        function processSequenceAsap(_, obsr) {
            const tgt = observationTarget.querySelector(seq[i]);
            if (tgt) {
                Clicker.#process(tgt);
                i++;
                if (i == seq.length) {
                    obsr.disconnect();
                }
            }
        }
        // luodaan joka kerta uusi observer. Onkohan liian kallista?
        const observer = new MutationObserver(processSequenceAsap);
        observer.observe(observationTarget, {childList:true, subtree:true});
        Clicker.#process(observationTarget.querySelector(seq[i++]));

        // Suljetaan tarkkailu varmuuden vuoksi. Voi aiheuttaa ongelmia jos jonkin toisen kutsun aloittama ketjun käsittely menossa.
        setTimeout(()=> observer.disconnect(), 1000);
    }
}


/**
 * Taulukko kokonaisluvuista välillä [first, last]
 * @param {Number} first välin ensimmäinen luku
 * @param {Number} last välin viimeinen luku
 * @returns taulukko
 */
function intRange(first, last) {
        const len = last - first + 1; // last included
        return Array.from({ length: len }, (v, i) => first+i);
        
}


/**
 * Poistetaan ja palautetaan taulukosta yksi alkio annetun tavan perusteella.
 * @param {Array} array muokattava taulukko
 * @param {String} approach "random" tai "linear"(oletus)
 * @returns taulukosta poistettu alkio
 */
function pickOne(array, approach) {
    switch (approach) {
        case "random":
            const i = randomInt(0, array.length);
            return array.splice(i,1)[0];
        case "linear": 
        default:
            return array.shift();
    }
}


/**
 * Satunnainen kokonaisluku väliltä [a, b-1].
 * @param {Number} a inklusiivinen alaraja
 * @param {Number} b eksklusiivinen yläraja
 * @returns satunnaisluku
 */
function randomInt(a, b) {
    return a + Math.floor(Math.random() * (a-b));
}

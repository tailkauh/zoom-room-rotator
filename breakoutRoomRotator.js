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

/**
 * Luokka jonka oliot kiertelevät Breakout-huoneissa Zoom web clientissä.
 * TODO
 *  -[ ] nykyiseen huoneeseen liittymisen estäminen
 *  -[ ] tyhjän huoneen skippaaminen
 *  -[ ] huoneiden tietojen hakeminen
 *  -[ ] join confirm käsittelijän kutsu painikkeiden painamisen sijasa (onko edes mahdollista) 
 */
class BreakoutRoomRotator {
    // TODO unohda staattisuus
    current; // TODO korjaa etsimään nykyinen kunnolla
    next;
    first = 1;
    last = 100;
    interval = 50;
    approach = "linear";
    rooms = [];

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

    //pause

    /**
     * Liittyy annettuun breakout-huoneeseen Zoomin web versiossa
     * TODO:
     *  -[ ] nykyiseen huoneeseen liittymisen estäminen
     * @param {Number} breakoutRoomNumber 
     * @returns 
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

    setRoomRange(first, last) {
        this.first = first;
        this.last = last;
        this.rooms = intRange(first, last);
    }

    #rotate() {
        
        // Tarviiko?:
        // current = current >= end ? 1 : current + 1;
    }

    static createAndStartLinear(startRoom, endRoom, secondsInRoom=60) {
        const rotator = new BreakoutRoomRotator();
        rotator.start(startRoom, endRoom, secondsInRoom);
        return rotator;
    }

    static createAndStartRandom(startRoom, endRoom, secondsInRoom=60) {
        const rotator = new BreakoutRoomRotator();
        rotator.approach = "random";
        rotator.start(startRoom, endRoom, secondsInRoom);
        return rotator;
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
            todo.elapsed++;
            if (todo.elapsed % todo.interval == 0) {
                todo.task();
                todo.times--;
            }
            if (todo.times < 1) {
                t[i] = t[j--];
                t.pop();
            }
        }
    }
    
    /**
     * Lisätään toistuva tehtävä tehtävälistalle.
     * Suoritetaan ensimmäinen toisto.
     * @param {*} task tehtävä
     * @param {*} interval sekuntit kuinka usein tehtävä suoritetaan
     * @param {*} times kuinka monta kertaa tehtävää tehdään
     */
    static repeat(task, interval, times=Number.POSITIVE_INFINITY) {
        task();
        Ajastin.#todoList.push({
            task: task,
            elapsed: 0,
            interval: interval,
            times: --times
        });
    }

    /**
     * Tyhjennetään tehtävälista
     */
    static clear() {
        Ajastin.#todoList = [];
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

// Utility functions

function intRange(first, last) {
        const len = last - first + 1; // last included
        return Array.from({ length: len }, (v, i) => first+i);
        
}

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

function randomInt(a, b) {
    return a + Math.floor(Math.random() * (a-b));
}
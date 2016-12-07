/**
 * User: anderlu
 * Date: 2016/12/6
 * Time: 11:03
 */
import Component from '../Component'
import * as dom from '../dom'
import * as util from '../util'

let wording = {
    od: '原画',
    hd: '高清',
    sd: '标清'
};
export default class ClaritySwitcher extends Component {
    constructor(player) {
        super(player, 'ClaritySwitcher');
    }
    render(owner){
        this.show = false;
        this.createEl('div', {'class': 'vcp-clarityswitcher'});
        this.current = dom.createEl('a', {'class': 'vcp-vertical-switcher-current'});
        this.container = dom.createEl('div', {'class': 'vcp-vertical-switcher-container'});
        this.items = [];
        this.currentItem = '';
        let vs = this.options.videoSource;
        this.current.innerHTML = wording[vs.curDef];
        this.el.appendChild(this.current);

        for(let i=0 ; i< vs.definitions.length; i++){
            let item = dom.createEl('a', {'class': 'vcp-vertical-switcher-item'});
            item.innerHTML = wording[vs.definitions[i]];
            if(vs.definitions[i] == vs.curDef){
                item.classList.add('current');
                this.currentItem = item;
            }
            item.setAttribute('data-def',vs.definitions[i]);
            this.items.push(item);
            this.container.appendChild(item);
        }
        this.el.appendChild(this.container);
        return super.render(owner);
    }
    setup() {
        this.on('click', this.onClick);
        this.on('mouseenter', this.onMouseEnter);
        this.on('mouseleave', this.onMouseLeave);

        // this.sub('play', this.player.video, util.bind(this, this.handleMsg));
        // this.sub('pause', this.player.video, util.bind(this, this.handleMsg));
    }
    onClick(event) {
        console.log(this, event.target.getAttribute('data-def'));
        let def = event.target.getAttribute('data-def');
        if(def){
            this.current.innerHTML = wording[def];
            this.currentItem.classList.remove('current');
            event.target.classList.add('current');
            this.currentItem = event.target;
            this.player.switchClarity(def);
        }else{
            if(!this.show){

            }else{

            }
        }
    }
    onMouseLeave(){
        this.container.style.display = 'none';
        this.show = false;
    }
    onMouseEnter(){
        this.container.style.display = 'block';
        this.show = true;
    }
}
/**
 * User: anderlu
 * Date: 2016/12/6
 * Time: 11:03
 */
import Component from '../Component'
import * as dom from '../dom'
import * as util from '../util'

export default class ClaritySwitcher extends Component {
    constructor(player) {
        super(player, 'ClaritySwitcher');
    }
    render(owner){
        this.createEl('div', {'class': 'vcp-clarityswitcher'});
        return super.render(owner);
    }
    setup() {
        this.on('click', this.onClick);
        // this.sub('play', this.player.video, util.bind(this, this.handleMsg));
        // this.sub('pause', this.player.video, util.bind(this, this.handleMsg));
    }
    onClick(event) {
        //console.log(this, event);
        this.player.switchClarity();
    }
}
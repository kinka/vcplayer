import * as message from '../src/message'
import * as util from '../src/util'
import Player from '../src/Player'

describe('message', function() {
	var player;

	before(function() {
		player = new Player({
			owner: 'demo_video',
			autoplay: false,
			width: 300,
			height: 400,
			src: 'http://2527.vod.myqcloud.com/2527_bffd50081d9911e6b0f4d93c5d81f265.f20.mp4',
			poster: 'https://s3.amazonaws.com/github/ribbons/forkme_left_orange_ff7600.png',
			// listener: util.bind(this, handleMsg)
		});
	});
	afterEach(function() {
		// message.unsub('*', '*', '*', player);
	})
	after(function() {
		setTimeout(function() {
			// player.destroy();
		}, 5000);
	});
	describe('#sub', function() {
		it('shoud receive (somemsg, *)', function(done) {
			message.sub('somemsg', '*', util.bind(this, function(msg) {
				expect(msg.type).to.be('somemsg');
				expect(msg.type).not.to.be('loadeddata');
				done();
			}), player);

			message.pub({type: 'somemsg', src: 'any'}, player);
		});
		it('should receive (*, *)', function(done) {
			message.sub('*', '*', util.bind(this, function(msg) {
				expect(msg.type).to.match(/somemsg|loadeddata/);
				done();
			}), player);

			message.pub({type: 'somemsg', src: 'any'}, player);
		});

		it('shoud receive (somemsg, IamTarget)', function(done) {
			message.sub('somemsg', 'IamTarget', util.bind(this, function(msg) {
				expect(msg.type).to.be('somemsg');
				expect(msg.src).to.be('IamTarget');
				done();
			}), player);

			message.pub({type: 'somemsg', src: 'IamTarget'}, player);
		});
		it('shoud receive (*, target)', function(done) {
			message.sub('*', 'IamTarget', util.bind(this, function(msg) {
				expect(msg.type).to.match(/somemsg/);
				expect(msg.src).to.be('IamTarget');
				done();
			}), player);

			message.pub({type: 'somemsg', src: 'IamTarget'}, player);
		});
	});

	describe('#unsub', function() {
		it('should not receive (anymsg, anyone)', function(done) {
			message.unsub('*', '*', '*', player); // clear all
			
			var fn = util.bind(this, function(msg) {
				if (msg.src === 'anyone' && msg.type === 'anymsg')
					expect().fail('should not be called');
				else if (msg.src === 'another')
					expect(msg.type).to.be('anymsg') && done();
				else if (msg.type === 'anymsg')
					expect(msg.src).to.be('another');
			});
			message.sub('anymsg', 'anyone', fn, player);
			message.sub('anymsg', 'another', fn, player);
			message.sub('anymsg1', 'anyone', fn, player);

			message.unsub('anymsg', 'anyone', fn, player);

			message.pub({type: 'anymsg', src: 'anyone'}, player);
			message.pub({type: 'anymsg1', src: 'anyone'}, player);
			message.pub({type: 'anymsg', src: 'another'}, player);
			setTimeout(done, 100);
		});

		it('should not receive (anymsg, *)', function(done) {
			message.unsub('*', '*', '*', player); // clear all

			var fn = util.bind(this, function(msg) {
				if (msg.type === 'anymsg')
					expect().fail('should not be called');
				else
					expect(msg.type).to.be('anymsg1') && done();
			});
			message.sub('anymsg', '*', fn, player);
			message.sub('anymsg', 'anyone', fn, player);
			message.sub('anymsg1', 'anyone', fn, player);

			message.unsub('anymsg', '*', fn, player);

			message.pub({type: 'anymsg', src: 'anyone'}, player);
			message.pub({type: 'anymsg1', src: 'anyone'}, player);
			setTimeout(done, 100);
		});

		it('should not receive (*, anyone)', function(done) {
			message.unsub('*', '*', '*', player); // clear all

			var fn = util.bind(this, function(msg) {
				if (msg.src === 'anyone') {
					expect().fail('anyone should not be called');
				} else {
					expect(msg.src).to.be('another');
					done();
				}
			});
			message.sub('anymsg', 'anyone', fn, player);
			message.sub('anymsg1', 'anyone', fn, player);
			message.sub('anymsg', 'another', fn, player);

			message.unsub('*', 'anyone', fn, player);

			message.pub({type: 'anymsg', src: 'anyone'}, player);
			message.pub({type: 'anymsg1', src: 'anyone'}, player);
			message.pub({type: 'anymsg', src: 'another'}, player);
			setTimeout(done, 100);
		});

		it('should not receive (*, *)', function(done) {
			message.unsub('*', '*', '*', player); // clear all

			var fn = util.bind(this, function(msg) {
				expect().fail('anything should not be called');
			});
			message.sub('anymsg', 'anyone', fn, player);
			message.sub('anymsg1', 'anyone', fn, player);
			message.sub('anymsg', 'another', fn, player);

			message.unsub('*', '*', fn, player);

			message.pub({type: 'anymsg', src: 'anyone'}, player);
			message.pub({type: 'anymsg1', src: 'anyone'}, player);
			message.pub({type: 'anymsg', src: 'another'}, player);
			setTimeout(done, 100);
		});
	});
});
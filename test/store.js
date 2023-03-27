const Observable = global.Observable = require('../Observer');
const Store = require('../Store');
const assert = require('chai').assert;
const logList = function( list ){
    console.log( list.map( ( { path, val } ) => `${path} > ${JSON.stringify( val )}` ).join( '\n' ) )
};
const fixList = function( list ){
    console.log( `assert.equal(list.length, ${list.length});` );
    console.log( list.map(
      ( { path, val }, n ) =>
        `assert.equal(list[${n}].path, ${JSON.stringify( path )});
assert.deepEqual(list[${n}].val, ${JSON.stringify( val )});
` ).join( '\n' )
    )
};

describe('store', function(){

    it( 'should set and get simple values', function(){
        const s = new Store( {} );
        s.set( 'a', 5 );
        assert.equal( s.get( 'a' ), 5 );
        s.set( 'b', 'abc' );
        assert.equal( s.get( 'b' ), 'abc' );
        assert.equal( s.get( 'a' ), 5 );
        s.set( 'c', [ 1, 2, 3 ] );
        assert.deepEqual( s.get( 'c' ), [ 1, 2, 3 ] );
    } );
    it( 'should set complex values', function(){
        const s = new Store( {} );
        s.set( 'a.b.c', 33 );
        assert.equal( s.get( 'a.b.c' ), 33 );
        s.set( 'a.b', { c: 12, d: 20 } );
        assert.equal( s.get( 'a.b.c' ), 12 );
        assert.equal( s.get( 'a.b.d' ), 20 );
        s.set( 'a.b', null );
        assert.equal( s.get( 'a.b.d' ), void 0 );
    } );

    it( 'should fire changes for simple values', function(){
        const s = new Store( { a: 4, b: 5, c: 6 } );
        let list;
        s.events.on( 'change', function( path, val ){
            list.push( { path, val } )
        } );

        list = [];
        s.set( 'a', 4 );
        assert.equal( list.length, 0 );


        list = [];
        s.set( 'b', 4 );
        assert.equal( list.length, 1 );
        assert.equal( list[ 0 ].path, 'b' );
        assert.equal( list[ 0 ].val, 4 );

        list = [];
        s.set( 'c', { kk: 2 } );
        assert.equal( list.length, 2 );
        assert.equal( list[ 0 ].path, 'c.kk' );
        assert.equal( list[ 0 ].val, 2 );

        assert.equal( list[ 1 ].path, 'c' );
        assert.deepEqual( list[ 1 ].val, { kk: 2 } );

    } );

    it( 'should fire changes for complex values', function(){
        const s = new Store( {} );
        let list;
        s.events.on( 'change', function( path, val ){
            list.push( { path, val } )
        } );

        list = [];
        s.set( 'a.b.c', 33 );
        assert.equal( list.length, 3 );
        assert.equal( list[ 0 ].path, "a.b.c" );
        assert.deepEqual( list[ 0 ].val, 33 );

        assert.equal( list[ 1 ].path, "a.b" );
        assert.deepEqual( list[ 1 ].val, { "c": 33 } );

        assert.equal( list[ 2 ].path, "a" );
        assert.deepEqual( list[ 2 ].val, { "b": { "c": 33 } } );


        list = [];
        s.set( 'a.b', { c: 12, d: 20 } );
        assert.equal( list.length, 2 );
        assert.equal( list[ 0 ].path, "a.b.d" );
        assert.deepEqual( list[ 0 ].val, 20 );

        assert.equal( list[ 1 ].path, "a.b.c" );
        assert.deepEqual( list[ 1 ].val, 12 );


        list = [];
        s.set( 'a.b', null );
        assert.equal( list.length, 1 );
        assert.equal( list[ 0 ].path, "a.b" );
        assert.deepEqual( list[ 0 ].val, null );

        list = [];
        s.set( 'a.b', { c: 12, d: 20 } );
        assert.equal( list.length, 3 );
        assert.equal( list[ 0 ].path, "a.b.d" );
        assert.deepEqual( list[ 0 ].val, 20 );

        assert.equal( list[ 1 ].path, "a.b.c" );
        assert.deepEqual( list[ 1 ].val, 12 );

        assert.equal( list[ 2 ].path, "a.b" );
        assert.deepEqual( list[ 2 ].val, { "c": 12, "d": 20 } );


        list = [];

        s.set( 'a.b', { x: { y: 3 } } );
        assert.equal( list.length, 4 );
        assert.equal( list[ 0 ].path, "a.b.d" );
        assert.deepEqual( list[ 0 ].val, undefined );

        assert.equal( list[ 1 ].path, "a.b.c" );
        assert.deepEqual( list[ 1 ].val, undefined );

        assert.equal( list[ 2 ].path, "a.b.x.y" );
        assert.deepEqual( list[ 2 ].val, 3 );

        assert.equal( list[ 3 ].path, "a.b.x" );
        assert.deepEqual( list[ 3 ].val, { "y": 3 } );


        //fixList(list)
    } );
    it( 'should fire changes for even more complex values', function(){
        const s = new Store( {} );
        let list = [];
        s.events.on( 'change', function( path, val ){
            list.push( { path, val } )
        } );
        let startVal;
        s.set( 'a.b', startVal = { c: 12, d: { e: 1, f: 2, g: [ 3, 4, { h: 5 } ] } } );
        assert.deepEqual( s._props, { a: { b: startVal } } )
        list = [];

        s.set( 'a.b', { c: 12, f: 22 } );
        assert.equal( list.length, 8 );
        assert.equal( list[ 0 ].path, "a.b.d.g.2.h" );
        assert.deepEqual( list[ 0 ].val, undefined );

        assert.equal( list[ 1 ].path, "a.b.d.g.2" );
        assert.deepEqual( list[ 1 ].val, undefined );

        assert.equal( list[ 2 ].path, "a.b.d.g.1" );
        assert.deepEqual( list[ 2 ].val, undefined );

        assert.equal( list[ 3 ].path, "a.b.d.g.0" );
        assert.deepEqual( list[ 3 ].val, undefined );

        assert.equal( list[ 4 ].path, "a.b.d.g" );
        assert.deepEqual( list[ 4 ].val, undefined );

        assert.equal( list[ 5 ].path, "a.b.d.f" );
        assert.deepEqual( list[ 5 ].val, undefined );

        assert.equal( list[ 6 ].path, "a.b.d.e" );
        assert.deepEqual( list[ 6 ].val, undefined );

        assert.equal( list[ 7 ].path, "a.b.f" );
        assert.deepEqual( list[ 7 ].val, 22 );


        console.log( JSON.stringify( s._props ) )
    } );

    it( 'should get slices and change them', function(){
        const s = new Store( {} );

        let startVal;
        s.set( 'a.b', startVal = { c: 12, d: { e: 1, f: 2, g: [ 3, 4, { h: 5, i: [] } ] } } );
        let arr1 = s.array( 'a.b.d.g' ),
          item = arr1.item( 2 ),
          arr2 = item.array( 'i' );

        arr2.push( { id: 1, name: 'name' } );

        assert.deepEqual( arr2.get( 0 ), { id: 1, name: 'name' } );
        assert.deepEqual( s.get( 'a.b.d.g.2.i.0' ), { id: 1, name: 'name' } );
    } );


    it( 'should be singletons', function(){
        const s = new Store( {} );
        let list = [];
        s.events.on( 'change', function( path, val ){
            list.push( { path, val } )
        } );
        let startVal;
        s.set( 'a.b', startVal = { c: 12, d: { e: 1, f: 2, g: [ 3, 4, { h: 5, i: [] } ] } } );
        let arr1 = s.array( 'a.b.d.g' ),
          item = arr1.item( 2 ),
          arr2 = item.array( 'i' ),
          arr2_clone = item.array( 'i' );

        list = [];

        arr2_clone.on('add', function(a,b,c,d) {
            if(a.id === 1){
                assert.equal( a.name, 'name' );
                assert.equal( d, 0 );
            }else{
                assert.equal(a.name, 'name2');
                assert.equal( d, 1 );
            }

        })

        arr2.push( { id: 1, name: 'name' } );
        arr2.push( { id: 2, name: 'name2' } );

        logList( list );
    } );
});
describe('array store', function() {
    it('should push and pop', function () {
        const s = new Store({});
        let list = [];
        s.events.on('change', function(path, val) {
            list.push({path, val})
        });
        let startVal;
        s.set('a.b', startVal = {c:12, d: {e:1, f: 2, g: [3, 4, {h: 5, i: []}]}});
        let arr1 = s.array('a.b.d.g'),
          item = arr1.item(2),
          arr2 = item.array('i');

        list = [];

        arr2.push({id: 1, name: 'name'});
        arr2.push({id: 2, name: 'name2'});
        logList(list);

        list = [];
        arr2.pop();
        logList(list);
    });
    /*it('inserting', function () {
        const s = new Store({});
        let list = [];
        s.events.on('change', function(path, val) {
            list.push({path, val})
        });
        let startVal;
        s.set('a.b', startVal = {c:12, d: {e:1, f: 2, g: [3, 4, {h: 5, i: []}]}});
        let arr1 = s.array('a.b.d.g'),
          item = arr1.item(2),
          arr2 = item.array('i');

        list = [];
        arr2.onInsert(function(pos) {

        });
        arr2.push({id: 1, name: 'name'});
        arr2.push({id: 2, name: 'name2'});
        logList(list);

        list = [];
        arr2.pop();
        logList(list);
    });*/
});
describe('array events', function() {
    it('resubscribed items should fire events', function (){
        const s = new Store( {} );
        let list = [];
        s.events.on( 'change', function( path, val ){
            list.push( { path, val } )
        } );
        let startVal;
        s.set( 'a.b', startVal = {
            c: 12, d: {
                e: 1, f: 2,
                arr: [ 3, 4, { h: 5, subArr: [ 2, 3 ] } ]
            }
        } );
        let arr1 = s.array( 'a.b.d.arr' );
        arr1.on( 'add', function( item, before, after, position ){
            console.log( 'add fired' )
        } );
        var arr2 = arr1.item( '2' ).array( 'subArr' );

        arr2.on( 'add', function( item, before, after, position ){
            console.log( 'sub add fired' )

        } );

        var fired = false;
        s.array( 'a.b.d.arr' ).item( '2' ).array( 'subArr' ).on( 'add', function(){
            fired = true;
            console.log( 'another sub add fired' )
        } )

        arr2.push( 'item' );
        arr1.push( 6 );
        arr2.push( { s: { u: {} } } );
        var sub = arr2.item( '3' );
        sub.events.on( 'change', function( path, val ){
            list.push( { path, val } )
        } );
        sub.set( 'u.b', 'inner' )
        assert.equal(fired, true);
        //console.log(list)
        //debugger
    });
    it('should fire normal change event when array item adds', function() {
        const s = new Store( {arr: [{a: 1}, {a: 2, subArr: []}]} ),
            arr = s.array('arr');

        let changeFired, item;
        s.sub('arr', function(a) {
            changeFired = true;
        }, true);
        arr.push(item = {a: 3});

        assert.equal(changeFired, true);
    });
    it('should fire normal change event when array item adds', function() {
        const s = new Store( {arr: [{a: 1}, {a: 2}]} ),
          arr = s.array('arr');

        let changeFired, item;
        s.sub('arr', function(a) {
            changeFired = true;
        }, true);
        arr.pop();

        assert.equal(changeFired, true);
    });
    it('subsubarray add', function() {
        const s = new Store( {arr: [{a: 1}, {a: 2, subArr: []}]} ),
          arr = s.array('arr');

        let changeFired = 0, changeFiredInner = 0;
        s.sub('arr', function(a) {
            changeFired++;
        }, true);
        var item = arr.item(1)

        item.sub('subArr', function(a) {
            changeFiredInner++;
        }, true);
        item.array('subArr').push({item: true});

        assert.equal(changeFired, 1);
        assert.equal(changeFiredInner, 1);
    });
});

describe('Array store should be indexable', function() {
    it('indexes should make it faster', function(){
        var testCount = 1200;
        var accessSequence = [];
        for(var i = 0; i < testCount; i++)
            accessSequence.push(Math.random()*testCount|0);

        var bench = function(s, count){
            var tStart = +new Date();
            for(var i = 0; i < count; i++){
                s.push({ID: i+'-id', num: i, reverseID: count-i-1+'-rev'});
            }
            var tFilled = +new Date();
            for(var i = 0, _i = accessSequence.length; i < _i; i++){
                var id = accessSequence[i];
                assert.equal(s.find({ID: id+'-id'})[0].num, id);
            }
            for(var i = 0, _i = accessSequence.length; i < _i; i++){
                var id = accessSequence[i];
                assert.equal(s.find({reverseID: id+'-rev'})[0].num, count-id-1);
            }
            var tEnd = +new Date();

            return {fill: tFilled-tStart, search: tEnd-tFilled, total: tEnd - tStart}
        };
        var getMetrics = function(dataPrepareFn) {
            var result = [];
            for(var i = 0; i <10; i++){
                result.push(dataPrepareFn(bench));
            }
            var sorted = result.sort((a,b)=>a.total-b.total);
            sorted.pop();
            sorted.shift();
            var reduced = sorted.reduce(function(store, obj){
                for(var key in obj){
                    store[key] = (store[key]||0)+obj[key];
                }
                return store;
            },{});
            for(var key in reduced){
                reduced[key] /= sorted.length;
            }
            return reduced;
        };

        var original = getMetrics(function(bench){
            var s = new Store({arr: [], indexedArr: []});
            var notIndexed = s.array('arr');
            return bench(notIndexed, testCount)
        });
/*
        var indexedID = getMetrics(function(bench){
            var s = new Store({arr: [], indexedArr: []});
            var indexed = s.array('arr').index({'ID': true});
            return bench(indexed, testCount)
        });*/

        var indexed = getMetrics(function(bench){
            var s = new Store({arr: [], indexedArr: []});
            var indexed = s.array('arr').index({'ID': true, 'reverseID': true});
            return bench(indexed, testCount)
        });

        assert.equal(original.fill/1.1 < indexed.fill, true)
        assert.equal(original.search / Math.log2(testCount)/2> indexed.search, true)
        console.log(original);
        console.log(indexed);
    });
    it('should work with multiple indexes', function(){
        var s = new Store({arr: []}),
            arr = s.array('arr');

        for(var i = 'a'; i <= 'm'; i = String.fromCharCode(i.charCodeAt(0)+1)) {
            arr.index({[i]: true});
        }
        var start = +new Date();
        for(var i = 1; i < 100000; i++){
            arr.push({a: i, b: i%2, c:i%3, d: i%5, e: i%7, f: i%11, g: i%13, h: i%17, i: i%19, j: i%23})
        }
        for(var i = 1; i < 100; i++){
            arr.pop()
        }
        var matchStart = +new Date();
        for(var i = 1; i < 1000; i++) {
            assert( Math.abs( 100000 / ( 19 * 23 ) - ( arr.find( { i: 0, j: 0 } ).length ) ) < 3 );
        }

        var end = +new Date();
        console.log(matchStart-start, end-matchStart);
    });

});

describe('Bug with subscribing to multiple bindings', function() {
    it('should call fn with both values setted', function(){
        const s = new Store( { a: '1', b: '2' } ),
          bind1 = s.bind( 'a' ),
          bind2 = s.bind( 'b' );

        s.sub( [ bind1, bind2 ], function( a, b ){
            assert.equal( a, '1' );
            assert.equal( b, '2' );
        } );
    });
});
describe('Feature. Binding.valEqual', function() {
    it('Should trigger fn when value is changed', function() {
        var str = new Store.Value.String('123');
        var changes = [];

        str.valEqual('16')(changes.push.bind(changes));
        //false +init

        str.set('17');
        //false

        str.set('123')
        //false

        str.set('17');
        //false

        str.set('16');
        //true +change

        str.set('88')
        //false +change

        str.set('16');
        //true +change

        str.set('16');
        //true

        assert.deepEqual(changes, [false, true, false, true]);

        var str = new Store.Value.String('123');
        var changes = [];

        str.valEqual('123')(changes.push.bind(changes));
        //true +init

        str.set('17');
        //false +change

        str.set('123')
        //true +change

        str.set('17');
        //false +change

        str.set('16');
        //false

        str.set('88')
        //false

        str.set('16');
        //false

        str.set('16');
        //false

        assert.deepEqual(changes, [true, false, true, false]);

    });
});


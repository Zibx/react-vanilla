;(function(){
  /** @namespace D.Field */

    // Standard components that are well suited for creating basic forms
  D.Field = D.Field || {};


  /**
   * Boolean Field Component
   *
   * @param {Object} cfg - Configuration options for the field
   * @param {ReactiveValue<boolean>} [cfg.bind] - Reactive binding for the field value
   * @param {string} [cfg.label] - Optional label displayed on the right side of the switch
   * @param {string} [cfg.leftLabel] - Optional label displayed on the left side of the switch
   * @returns {HTMLElement} Returns a labeled switch element
   */
  D.Field.Boolean = D.declare('field.Boolean', (cfg)=> {

    var input = D.h('input', {cls:"switch__input js-switch-action", type:"checkbox", "aria-label":"Enable the trigger"});
    if(cfg.bind){
      cfg.bind.hook(val => input.checked = val);
    };

    var change = Store.debounce(function(e){
      cfg.bind.set(input.checked)
    },5);

    'input, change,click, mouseup'.split(',')
      .map(a=>a.trim())
      .forEach(evt => input.addEventListener(evt, change));

    return D.h('label', {cls: "switch", title: "Enable the trigger"},
      cfg.false,
      (cfg.leftLabel ?
        D.h('span', {cls: "switch__switch--title switch__switch--left-title"}, cfg.leftLabel)
        : null),
      input,
      D.h('span', {cls: "switch__switch"}),
      (cfg.label ?
        D.h('span', {cls: "switch__switch--title"}, cfg.label)
        : null)

    );
  });


  D.Field.Slider = D.declare('field.Slider', (cfg)=> {
    var input = D.h('input', {cls:"cmp-slider__input", type:"range", min: cfg.min, max: cfg.max, step: cfg.step});
    if(cfg.bind){
      cfg.bind.hook(val => input.value = val);
    };

    var change = Store.debounce(function(e){
      cfg.bind.set(parseFloat(input.value))
    },5);

    'input, change,click, mouseup'.split(',')
      .map(a=>a.trim())
      .forEach(evt => input.addEventListener(evt, change));

    return D.h('label', {cls: "cmp-slider", title: "Change value"},

      (cfg.label ?
        D.h('span', {cls: "cmp-slider--title"}, cfg.label)
        : null),

      input,
      (cfg.after ? cfg.after : null)

    );

  });

  D.Field.Text = D.declare('Field.Text', (cfg)=> {

    var input = D.h('input', {cls:"text--input", type:"text", "aria-label":"Change value"});
    if(cfg.bind){
      cfg.bind.hook(val => {
        input.value = val || '';
      });
    };

    var change = Store.debounce(function(e){
      var val = input.value;
      cfg.bind.set(val)
    },5);

    'input,change,click,mouseup'.split(',')
      .map(a=>a.trim())
      .forEach(evt => input.addEventListener(evt, change));

    return D.h('label', {cls: "text-input", title: "Change text"},
      (cfg.label ?
        D.h('span', {cls: "text-input--title"}, cfg.label)
        : null),
      input

    );
  });

  D.Field.Color = D.declare('Field.Color', (cfg)=> {
    var input = D.h('input', {cls:"color--input", type:"color", "aria-label":"Change color"});
    if(cfg.bind){
      cfg.bind.hook(color => {
        var val = '#'+ [(( color & 0xff0000 ) >> 16 ),
          ( color & 0x00ff00 )>>8,
          ( ( color & 0x0000ff )  )].map(a=>('0'+a.toString(16)).substr(-2)).join('');
        input.value = val

      });
    };

    var change = Store.debounce(function(e){
      var val = parseInt(input.value.substr(1),16)
      cfg.bind.set(val)
    },5);

    'input, change,click, mouseup'.split(',')
      .map(a=>a.trim())
      .forEach(evt => input.addEventListener(evt, change));

    return D.h('label', {cls: "color-input", title: "Change color"},
      (cfg.leftLabel ?
        D.h('span', {cls: "color-input--title__left"}, cfg.leftLabel)
        : null),
      input,
      (cfg.label ?
        D.h('span', {cls: "color-input--title"}, cfg.label)
        : null)
    );

  });
})();
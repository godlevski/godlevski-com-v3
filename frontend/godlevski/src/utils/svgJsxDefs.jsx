import React from "react";

export const svgJsxDefsSettingsGlobal = {
  defNameSelector: 'dataName'
}

export default (svgJsx) => ({
  svgJsx,
  settings : {
    defNameSelector: 'dataName'
  },
  getDefs: function(){
    if(this.defs) return this.defs;

    const {props: { children: root }} = this.svgJsx();
    const {props: { children: defs }} = Array.isArray(root) ? root.find(el => el.type === 'defs') : root;
    
    this.defs = defs;

    return this.defs;
  },
  getSymbol: function(name){
    const defs = this.getDefs();

    return Array.isArray(defs)
      // more than one def 
      ? defs.find( el => el.props[this.settings.defNameSelector] === name ) 
      // single def, check if the one
      : defs.props[this.settings.defNameSelector] === name ? defs : undefined;
  },
  getSymbolAsGroup: function(name, args){
    const symbol = this.getSymbol(name);

    return symbol && symbol.props 
      ? React.createElement( 'g', {...symbol.props, ...args}) 
      : <g></g>;
  },
  getSymbolAsSvg: function(name, args){
    const symbol = this.getSymbol(name);

    return symbol && symbol.props 
      ? <svg
          xmlns="http://www.w3.org/2000/svg" 
          xmlnsXlink="http://www.w3.org/1999/xlink"
          {...symbol.props}
          {...args}>
          
            {args.children}
            {symbol.props.children}

          </svg>

      : null
  }

})
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

import $ from 'jquery'
import { GridStack } from 'gridstack/dist/gridstack.js'
import 'gridstack/dist/gridstack.css'
import differenceWith from 'lodash/differenceWith'
import map from 'lodash/map'

export default class Grid extends React.Component {

  constructor(props) {
    super(props);
    this.grid;
  }

  get layout() {
    const layout = map($('.grid-stack .grid-stack-item:visible'), el => {
      const node = $(el).data('_gridstack_node')
      return {
        id: node.id,
        maxHeight: node.maxHeight,
        maxWidth: node.maxWidth,
        minHeight: node.minHeight,
        minWidth: node.minWidth,
        height: node.height,
        width: node.width,
        x: node.x,
        y: node.y
      }
    })
    return layout
  }

  clear() {
    this.grid && this.grid.removeAll()
  }

  onAdded(e, items) {
    if(this.props.onAdded) {
      this.props.onAdded(e, items)
    }
  }
  onChange(e, items) {
    if(this.props.onChange) {
      this.props.onChange(e, items)
    }
  }
  onDisable(e) {
    if(this.props.onDisable) {
      this.props.onDisable(e)
    }
  }
  onDragStart(e, ui) {
    if(this.props.onDragStart) {
      this.props.onDragStart(e, ui)
    }
  }
  onDragStop(e, ui) {
    if(this.props.onDragStop) {
      this.props.onDragStop(e, ui)
    }
  }
  onEnable(e) {
    if(this.props.onEnable) {
      this.props.onEnable(e)
    }
  }
  onRemoved(e, items) {
    if(this.props.onRemoved) {
      this.props.onRemoved(e, items)
    }
  }
  onResizeStart(e, ui) {
    if(this.props.onResizeStart) {
      this.props.onResizeStart(e, ui)
    }
  }
  onResizeStop(e, ui) {
    if(this.props.onResizeStop) {
      this.props.onResizeStop(e, ui)
    }
  }

  componentDidMount() {

    var options = {
      acceptWidgets: this.props.acceptWidgets,
      alwaysShowResizeHandle: this.props.alwaysShowResizeHandle,
      animate: this.props.animate,
      auto: this.props.auto,
      cellHeight: this.props.cellHeight,
      column: this.props.column,
      ddPlugin: this.props.ddPlugin,
      disableDrag: this.props.disableDrag,
      disableOneColumnMode: this.props.disableOneColumnMode,
      disableResize: this.props.disableResize,
      dragIn: this.props.dragIn,
      dragInOptions: this.props.dragInOptions,
      draggable: this.props.draggable,
      dragOut: this.props.dragOut,
      float: this.props.float,
      handle: this.props.handle,
      handleClass: this.props.handleClass,
      itemClass: this.props.itemClass,
      margin: this.props.margin,
      marginTop: this.props.marginTop,
      marginRight: this.props.marginRight,
      marginBottom: this.props.marginBottom,
      marginLeft: this.props.marginLeft,
      maxRow: this.props.maxRow,
      minRow: this.props.minRow,
      minWidth: this.props.minWidth,
      oneColumnModeDomSort: this.props.oneColumnModeDomSort,
      placeholderClass: this.props.placeholderClass,
      placeholderText: this.props.placeholderText,
      removable: this.props.removable,
      removeTimeout: this.props.removeTimeout,
      resizable: this.props.resizable,
      row: this.props.row,
      rtl: this.props.rtl,
      staticGrid: this.props.staticGrid,
      styleInHead: this.props.styleInHead
    }

    this.gridstack = GridStack.init(options);
    this.gridstack.on('resizestop', this.onResizeStop.bind(this))
    this.gridstack.on('resizestart', this.onResizeStart.bind(this))
    this.gridstack.on('removed', this.onRemoved.bind(this))
    this.gridstack.on('dragstop', this.onDragStop.bind(this))
    this.gridstack.on('dragstart', this.onDragStart.bind(this))
    this.gridstack.on('disable', this.onDisable.bind(this))
    this.gridstack.on('enable', this.onEnable.bind(this))
    this.gridstack.on('change', this.onChange.bind(this))
    this.gridstack.on('added', this.onAdded.bind(this))


    this.props.children.forEach(child => {
      if (!child) return;
      this.gridstack.addWidget(
        '<div class="grid-stack-item"><div id="' + child.props.id + '" class="grid-stack-item-content"></div></div>',
        child.props.x,
        child.props.y,
        child.props.width,
        child.props.height,
        child.props.autoPosition,
        child.props.minWidth,
        child.props.maxWidth,
        child.props.minHeight,
        child.props.maxHeight,
        child.props.id
      )
      ReactDOM.render(child, document.getElementById(child.props.id))
    })
  }

  componentWillUnmount(){
    this.gridstack.off('resizestop', this.onResizeStop.bind(this))
    this.gridstack.off('resizestart', this.onResizeStart.bind(this))
    this.gridstack.off('removed', this.onRemoved.bind(this))
    this.gridstack.off('dragstop', this.onDragStop.bind(this))
    this.gridstack.off('dragstart', this.onDragStart.bind(this))
    this.gridstack.off('disable', this.onDisable.bind(this))
    this.gridstack.off('enable', this.onEnable.bind(this))
    this.gridstack.off('change', this.onChange.bind(this))
    this.gridstack.off('added', this.onAdded.bind(this))
  }

  componentDidUpdate(prevProps, prevState) {
    // If the list of widgets in props in empty, then simply clear the grid
    if (this.props.children.length === 0) {
      this.clear()
      return
    }

    // Find any widgets we need to remove
    const toRemove = differenceWith(prevProps.children, this.props.children, (a, b) => {
      return (a.props.id === b.props.id)
    })

    // Find new widgets or those we need to re-render
    const uniques = this.props.children.filter(newChild => {
      for (const index in prevProps.children) {
        const oldChild = prevProps.children[index]

        if (oldChild.props.id === newChild.props.id &&
            !newChild.props.onShouldUpdate(oldChild, newChild)) {
          return false
        }
      }
      return true
    })

    // Remove widgets that user said to remove
    toRemove.forEach(child => {
      const el = document.getElementById(child.props.id)
      if (el !== null) {
        ReactDOM.unmountComponentAtNode(el)
        this.gridstack.removeWidget(el.parentElement)
      }
    })

      // Add new widgets or re-render any widgets that changed
    uniques.forEach(child => {
      const el = document.getElementById(child.props.id)
      if (el !== null) {
        ReactDOM.unmountComponentAtNode(el)
      }
      else {
        this.gridstack.addWidget(
          '<div class="grid-stack-item"><div id="' + child.props.id + '" class="grid-stack-item-content"></div></div>',
          child.props.x,
          child.props.y,
          child.props.width,
          child.props.height,
          child.props.autoPosition,
          child.props.minWidth,
          child.props.maxWidth,
          child.props.minHeight,
          child.props.maxHeight,
          child.props.id
        )
      }
      ReactDOM.render(child, document.getElementById(child.props.id))
    })
  }

  render() {
    return (
      <div ref="gridstack" className="grid-stack" />
    )
  }
}

GridStack.propTypes = {
  acceptWidgets: PropTypes.bool,
  alwaysShowResizeHandle: PropTypes.bool,
  animate: PropTypes.bool,
  auto: PropTypes.bool,
  cellHeight: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  children: PropTypes.node,
  disableDrag: PropTypes.bool,
  disableResize: PropTypes.bool,
  draggable: PropTypes.object,
  float: PropTypes.bool,
  handle: PropTypes.string,
  handleClass: PropTypes.string,
  height: PropTypes.number,
  itemClass: PropTypes.string,
  minWidth: PropTypes.number,
  onAdded: PropTypes.func,
  onChange: PropTypes.func,
  onDisable: PropTypes.func,
  onDragStart: PropTypes.func,
  onDragStop: PropTypes.func,
  onEnable: PropTypes.func,
  onRemoved: PropTypes.func,
  onResizeStart: PropTypes.func,
  onResizeStop: PropTypes.func,
  placeholderClass: PropTypes.string,
  placeholderText: PropTypes.string,
  removable: PropTypes.bool,
  removeTimeout: PropTypes.number,
  resizable: PropTypes.bool,
  rtl: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.string
  ]),
  staticGrid: PropTypes.bool,
  verticalMargin: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  width: PropTypes.number
}

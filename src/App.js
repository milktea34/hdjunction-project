import './App.css';
import {useEffect, useReducer} from "react";

function reducer(state, action) {
    switch (action.type) {
        case 'DRAGSTART':
            return {
                ...state, start: action.value.start
            };
        case 'DRAGEND':
            let style = {
                position: 'absolute',
                border: '1px solid #000000',
                userSelect: 'none',
                width: Math.abs(state.start.x - action.value.end.x) + 'px',
                height: Math.abs(state.start.y - action.value.end.y) + 'px',
                top: action.value.end.y + 'px',
                left: action.value.end.x + 'px',
            }
            const translate = {
                x: 0, y: 0
            }
            if (state.start.x - action.value.end.x < 0) {
                translate.x = '-100%';
            } else {
                translate.x = '0%'
            }

            if (state.start.y - action.value.end.y < 0) {
                translate.y = '-100%';
            } else {
                translate.y = '0%'
            }

            style.transform = 'translate(' + translate.x + ', ' + translate.y + ')';

            if (action.value.drawType === 'circle') {
                style.borderRadius = '50%';
                return {
                    ...state, end: action.value.end, draws: {
                        ...state.draws, circles: state.draws.circles.concat({style: style})
                    }
                }
            } else {
                return {
                    ...state, end: action.value.end, draws: {
                        ...state.draws, boxes: state.draws.boxes.concat({style: style})
                    }
                }
            }

        case 'CHANGE_DRAW_TYPE':
            return {
                ...state, drawType: action.value.drawType
            };
        case 'CLEAR_ALL':
            return {
                ...state, draws: {
                    boxes: [], circles: []
                }
            }
        case 'LOAD_STORED_DRAWS':
            return {
                ...state, draws: {
                    ...action.value.draws
                }
            };
        case 'UPDATE_STORAGE':
            localStorage.setItem('draws', JSON.stringify(state.draws));
            return state;
        default:
            return state;
    }
}

const initialState = {
    start: {x: 0, y: 0}, end: {x: 0, y: 0}, drawType: 'box', draws: {
        boxes: [], circles: []
    }
}

function App() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const onDragStart = (e) => {
        dispatch({
            type: 'DRAGSTART', value: {start: {x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY}}
        });
    }
    const onDragEnd = (e) => {
        dispatch({
            type: 'DRAGEND',
            value: {end: {x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY}, drawType: state.drawType}
        });
        dispatch({type: 'UPDATE_STORAGE'});
    }

    const onChangeDrawType = (drawType) => {
        dispatch({type: 'CHANGE_DRAW_TYPE', value: {drawType: drawType}});
    }

    const clearAll = () => {
        dispatch({type: 'CLEAR_ALL'});
        dispatch({type: 'UPDATE_STORAGE'});
    }

    useEffect(() => {
        const storedDraws = localStorage.getItem('draws');
        if (storedDraws !== null) {
            dispatch({type: 'LOAD_STORED_DRAWS', value: {draws: JSON.parse(storedDraws)}});
        }
    }, []);

    return (<div className="App">
        <header className="App-header">
            <div className={"buttons"}>
                <button type={"button"} className={state.drawType === 'box' ? 'selected' : ''} onClick={() => {
                    onChangeDrawType('box')
                }}>box
                </button>
                <button type={"button"} className={state.drawType === 'circle' ? 'selected' : ''} onClick={() => {
                    onChangeDrawType('circle')
                }}>circle
                </button>
                <button type={"button"} onClick={clearAll}>clear</button>
            </div>
            <div className={"draw-area"}>
                <div draggable={"true"} style={{width: '100%', height: '100%', userSelect: 'none'}}
                     onDragStart={onDragStart}
                     onDragEnd={onDragEnd}>
                    {state.draws.circles.map((circle, index) => {
                        return <div style={circle.style} key={index}></div>
                    })}
                    {state.draws.boxes.map((box, index) => {
                        return <div style={box.style} key={index}></div>
                    })}
                </div>
            </div>
        </header>
    </div>);
}

export default App;

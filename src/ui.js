import xtend from 'xtend';
import Constants from './constants';

const classTypes = ['mode', 'feature', 'mouse'];

export default function (ctx) {
    const buttonElements = {};
    let activeButton = null;

    let currentMapClasses = {
        mode: null, // e.g. mode-direct_select
        feature: null, // e.g. feature-vertex
        mouse: null // e.g. mouse-move
    };

    let nextMapClasses = {
        mode: null,
        feature: null,
        mouse: null
    };

    function queueMapClasses(options) {
        nextMapClasses = xtend(nextMapClasses, options);
    }

    function updateMapClasses() {
        if (!ctx.container) return;

        const classesToRemove = [];
        const classesToAdd = [];

        classTypes.forEach((type) => {
            if (nextMapClasses[type] === currentMapClasses[type]) return;

            classesToRemove.push(`${type}-${currentMapClasses[type]}`);
            if (nextMapClasses[type] !== null) {
                classesToAdd.push(`${type}-${nextMapClasses[type]}`);
            }
        });

        if (classesToRemove.length > 0) {
            ctx.container.classList.remove.apply(ctx.container.classList, classesToRemove);
        }

        if (classesToAdd.length > 0) {
            ctx.container.classList.add.apply(ctx.container.classList, classesToAdd);
        }

        currentMapClasses = xtend(currentMapClasses, nextMapClasses);
    }

    function deactivateButtons() {
        if (!activeButton) return;
        activeButton.classList.remove(Constants.classes.ACTIVE_BUTTON);
        activeButton = null;
    }

    function setActiveButton(id) {
        deactivateButtons();

        const button = buttonElements[id];
        if (!button) return;

        if (button && id !== 'trash') {
            button.classList.add(Constants.classes.ACTIVE_BUTTON);
            activeButton = button;
        }
    }

    function createControlButton(id, options = {}) {
        const button = document.createElement('button');
        button.className = `${Constants.classes.CONTROL_BUTTON} ${options.className}`;
        button.setAttribute('title', options.title);
        options.container.appendChild(button);

        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const clickedButton = e.target;
            if (clickedButton === activeButton) {
                deactivateButtons();
                return;
            }

            setActiveButton(id);
            options.onActivate();
        }, true);

        return button;
    }

    function addButtons() {
        const controls = ctx.options.controls;
        const controlGroup = document.createElement('div');
        controlGroup.className = `${Constants.classes.CONTROL_GROUP} ${Constants.classes.CONTROL_BASE}`;

        if (!controls) return controlGroup;

        if (controls[Constants.types.LINE]) {
            buttonElements[Constants.types.LINE] = createControlButton(Constants.types.LINE, {
                container: controlGroup,
                className: Constants.classes.CONTROL_BUTTON_LINE,
                title: `LineString tool ${ctx.options.keybindings ? '(l)' : ''}`,
                onActivate: () => ctx.events.changeMode(Constants.modes.DRAW_LINE_STRING)
            });
        }

        if (controls[Constants.types.POLYGON]) {
            buttonElements[Constants.types.POLYGON] = createControlButton(Constants.types.POLYGON, {
                container: controlGroup,
                className: Constants.classes.CONTROL_BUTTON_POLYGON,
                title: `Polygon tool ${ctx.options.keybindings ? '(p)' : ''}`,
                onActivate: () => ctx.events.changeMode(Constants.modes.DRAW_POLYGON)
            });
        }

        if (controls[Constants.types.POINT]) {
            buttonElements[Constants.types.POINT] = createControlButton(Constants.types.POINT, {
                container: controlGroup,
                className: Constants.classes.CONTROL_BUTTON_POINT,
                title: `Marker tool ${ctx.options.keybindings ? '(m)' : ''}`,
                onActivate: () => ctx.events.changeMode(Constants.modes.DRAW_POINT)
            });
        }


        if (controls[Constants.types.CIRCLE]) {
            buttonElements[Constants.types.CIRCLE] = createControlButton(Constants.types.CIRCLE, {
                container: controlGroup,
                className: Constants.classes.CONTROL_BUTTON_CIRCLE,
                title: `Circle tool ${ctx.options.keybindings && '(c)'}`,
                onActivate: () => ctx.events.changeMode(Constants.modes.DRAW_CIRCLE)
            });
        }

        if (controls[Constants.types.TRIANGLE]) {
            buttonElements[Constants.types.TRIANGLE] = createControlButton(Constants.types.TRIANGLE, {
                container: controlGroup,
                className: Constants.classes.CONTROL_BUTTON_TRIANGLE,
                title: `Triangle tool ${ctx.options.keybindings && 't'}`,
                onActivate: () => ctx.events.changeMode(Constants.modes.DRAW_TRIANGLE)
            });
        }

        if (controls[Constants.types.RECTANGLE]) {
            buttonElements[Constants.types.RECTANGLE] = createControlButton(Constants.types.RECTANGLE, {
                container: controlGroup,
                className: Constants.classes.CONTROL_BUTTON_RECTANGLE,
                title: `Rectangle tool ${ctx.options.keybindings && 'r'}`,
                onActivate: () => ctx.events.changeMode(Constants.modes.DRAW_RECTANGLE)
            });
        }

        if (controls[Constants.types.SECTOR]) {
            buttonElements[Constants.types.SECTOR] = createControlButton(Constants.types.SECTOR, {
                container: controlGroup,
                className: Constants.classes.CONTROL_BUTTON_SECTOR,
                title: `Sector tool ${ctx.options.keybindings && 's'}`,
                onActivate: () => ctx.events.changeMode(Constants.modes.DRAW_SECTOR)
            });
        }

        if (controls[Constants.types.ARROW]) {
            buttonElements[Constants.types.ARROW] = createControlButton(Constants.types.ARROW, {
                container: controlGroup,
                className: Constants.classes.CONTROL_BUTTON_ARROW,
                title: `Arrow tool ${ctx.options.keybindings && 'a'}`,
                onActivate: () => ctx.events.changeMode(Constants.modes.DRAW_ARROW)
            });
        }
        //贝塞尔曲线
        if (controls[Constants.types.BEZIERARROW]) {
            buttonElements[Constants.types.BEZIERARROW] = createControlButton(Constants.types.BEZIERARROW, {
                container: controlGroup,
                className: Constants.classes.CONTROL_BUTTON_BEZIER_ARROW,
                title: `BezierArrow tool ${ctx.options.keybindings && 'b'}`,
                onActivate: () => ctx.events.changeMode(Constants.modes.DRAW_BEZIER_ARROW)
            });
        }

        if (controls.trash) {
            buttonElements.trash = createControlButton('trash', {
                container: controlGroup,
                className: Constants.classes.CONTROL_BUTTON_TRASH,
                title: 'Delete',
                onActivate: () => {
                    ctx.events.trash();
                }
            });
        }

        if (controls.combine_features) {
            buttonElements.combine_features = createControlButton('combineFeatures', {
                container: controlGroup,
                className: Constants.classes.CONTROL_BUTTON_COMBINE_FEATURES,
                title: 'Combine',
                onActivate: () => {
                    ctx.events.combineFeatures();
                }
            });
        }

        if (controls.uncombine_features) {
            buttonElements.uncombine_features = createControlButton('uncombineFeatures', {
                container: controlGroup,
                className: Constants.classes.CONTROL_BUTTON_UNCOMBINE_FEATURES,
                title: 'Uncombine',
                onActivate: () => {
                    ctx.events.uncombineFeatures();
                }
            });
        }

        return controlGroup;
    }

    function removeButtons() {
        Object.keys(buttonElements).forEach(buttonId => {
            const button = buttonElements[buttonId];
            if (button.parentNode) {
                button.parentNode.removeChild(button);
            }
            delete buttonElements[buttonId];
        });
    }

    return {
        setActiveButton,
        queueMapClasses,
        updateMapClasses,
        addButtons,
        removeButtons
    };
}

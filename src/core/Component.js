/**
 * Base Component class for building reactive UI components
 * Provides lifecycle management, state handling, and DOM manipulation
 */
export class Component {
    /**
     * @param {Object} props - Component properties passed from parent
     */
    constructor(props = {}) {
        this.props = props;
        this.state = {};
        this.element = null;
        this.children = [];
        this._initialized = false;
    }

    /**
     * Mount component to DOM
     * @param {string|HTMLElement} selector - CSS selector or DOM element
     * @returns {Component} this instance for chaining
     */
    mount(selector) {
        const container = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector;

        if (!container) {
            console.error(`Cannot mount component: selector "${selector}" not found`);
            return this;
        }

        container.innerHTML = this.render();
        this.element = container.firstElementChild;

        if (!this._initialized) {
            this._initialized = true;
            this.onInit();
        }

        this.afterMount();

        return this;
    }

    onInit() {
        // runs ONCE — override in child
    }

    /**
     * Lifecycle hook - Called after component is mounted to DOM
     * Override this to add event listeners, fetch data, mount children, etc.
     */
    afterMount() {
        // Override in subclass
    }

    /**
     * Update component state and trigger re-render
     * @param {Object} newState - Partial state object to merge
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.update();
    }

    /**
     * Re-render the component in place
     * Preserves parent node and re-runs afterMount lifecycle
     */
    update() {
        if (!this.element || !this.element.parentNode) {
            console.warn('Cannot update: component not mounted');
            return;
        }

        // Destroy children before re-render
        this.destroyChildren();

        const parent = this.element.parentNode;
        const newHTML = this.render();
        const temp = document.createElement('div');
        temp.innerHTML = newHTML;

        const newElement = temp.firstElementChild;
        if (newElement) {
            parent.replaceChild(newElement, this.element);
            this.element = newElement;
            this.afterMount();
        }
    }

    /**
     * Register a child component for lifecycle management
     * @param {Component} child - Child component instance
     */
    registerChild(child) {
        this.children.push(child);
    }

    /**
     * Destroy all child components
     */
    destroyChildren() {
        this.children.forEach(child => child.destroy());
        this.children = [];
    }

    /**
     * Cleanup and remove component from DOM
     * Override to add custom cleanup logic (e.g., remove event listeners)
     */
    destroy() {
        this.destroyChildren();

        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }

    /**
     * Template method - Override this to define component HTML
     * @returns {string} HTML string
     */
    render() {
        return `<div>Override render() method</div>`;
    }

    /**
     * Helper: Query element within component
     * @param {string} selector - CSS selector
     * @returns {HTMLElement|null}
     */
    $(selector) {
        return this.element?.querySelector(selector) || null;
    }

    /**
     * Helper: Query all elements within component
     * @param {string} selector - CSS selector
     * @returns {NodeList}
     */
    $$(selector) {
        return this.element?.querySelectorAll(selector) || [];
    }
}

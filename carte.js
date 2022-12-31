/**
 * A class used to create a DOM Element using
 * method chaining syntax.
 * @example 
 * let div = new Ele('div')
 *               .InnerText("my element's text")
 *               .AddClass('class-a class-b')
 *               .Element
 */
 class Ele
 {
    #ele
    /** 
     * Ele class constructor used to create a DOM Element using
     * method cascading syntax.
     * @param {string} tag The element's tag type to create
     * @example 
     * let div = new Ele('div')
     *               .InnerText("my element's text")
     *               .AddClass('class-a class-b')
     *               .Element
     */
     constructor(tag = "")
     {
        if(tag != "")
        {
            this.#ele = document.createElement(tag)
        }
     }

     /**
      * A static method for creating a new ELe object using the document.getElementById() method under the hood.
      * @param {string} id The id of the document element to base a new Ele object from.
      * @returns {Ele} A new Ele object.
      */
     static ById(id)
     {
        let result = new Eel()
        this.#ele = document.getElementById(id)
        return result
     }

     /**
      * Add one or more classes to the element.
      * @param {string} classes The class or classes to
      * add to the element.
      * @example
      * let div = new Ele('div')
      *               .AddClass('class-a class-b')
      *               .Element
      * @returns {this} The current instance of the Ele class.
      */
     AddClass(classes)
     {
        classes = classes.trim()
        if(classes)
        {
            classes.split(' ').forEach((cls) => {
                this.#ele.classList.add(cls)    
            })
        }
         return this
     }

     //#region Event Listeners
 
     /**
      * 
      * @param {function} fn The function to execute when the event is fired.
      * @returns {this} The current instance of the Ele class.
      */
     Event_Click(fn)
     {
        if(typeof fn === 'function')
        {
            this.#ele.addEventListener('click',fn)
        }
        return this
     }

     Event(type,fn)
     {
        if(typeof fn === 'function')
        {
            this.#ele.addEventListener(type,fn)
        }
        return this
     }

     //#endregion
 
     AppendChild(child)
     {
         this.#ele.appendChild(child)
         return this
     }
 
     AppendChildren(children = [])
     {
         children.forEach((child) => {
             this.#ele.appendChild(child)
         })
         return this
     }
 
     Id(id)
     {
         this.#ele.id = id
         return this
     }
 
     InnerText(txt)
     {
         this.#ele.innerText = txt
         return this
     }
 
     InnerHTML(html)
     {
         this.#ele.innerHTML = html
         return this
     }
 
     //#region Attributes

     Checked(state = true)
     {
        this.#ele.setAttribute('checked',state)
        return this
     }

     For(text)
     {
        this.#ele.setAttribute('for', text)
        return this
     }

     Name(text)
     {
        this.#ele.setAttribute('name', text)
        return this
     }
 
     Placeholder(text)
     {
         this.#ele.placeholder = text
         return this
     }

     Title(text)
     {
        this.#ele.setAttribute('title', text)
        return this
     }
 
     Type(type)
     {
         this.#ele.setAttribute('type',type)
         return this
     }

     Disable(state = true)
     {
        this.#ele.setAttribute('disabled',state)
        return this
     }
 
     //#endregion
 
     get Element()
     {
        return this.#ele
     }
 }
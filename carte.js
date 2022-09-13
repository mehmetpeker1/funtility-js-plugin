/**
 * A class used to create a DOM Element using
 * method cascading syntax.
 * @example 
 * let div = new Ele('div')
 *               .InnerText("my element's text")
 *               .AddClass('class-a class-b')
 *               .Element
 */
 class Ele
 {
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
     constructor(tag)
     {
         this.ele = document.createElement(tag)
     }

     /**
      * Add one or more classes to the element.
      * @param {string} classes The class or classes to
      * add to the element.
      * @example
      * let div = new Ele('div')
      *               .AddClass('class-a class-b')
      *               .Element
      * @returns {this}
      */
     AddClass(classes)
     {
         classes.split(' ').forEach((cls) => {
             this.ele.classList.add(cls)    
         })
         return this
     }

     //#region Event Listeners
 
     /**
      * 
      * @param {string} fn 
      * @returns 
      */
     Event_Click(fn)
     {
        if(typeof fn === 'function')
        {
            this.ele.addEventListener('click',fn)
        }
        return this
     }

     //#endregion
 
     AppendChild(child)
     {
         this.ele.appendChild(child)
         return this
     }
 
     AppendChildren(children = [])
     {
         children.forEach((child) => {
             this.ele.appendChild(child)
         })
         return this
     }
 
     Id(id)
     {
         this.ele.id = id
         return this
     }
 
     InnerText(txt)
     {
         this.ele.innerText = txt
         return this
     }
 
     InnerHTML(html)
     {
         this.ele.innerHTML = html
         return this
     }
 
     //#region Attributes
 
     Placeholder(text)
     {
         this.ele.placeholder = text
         return this
     }
 
     Type(type)
     {
         this.ele.setAttribute('type',type)
         return this
     }

     Disable()
     {
        this.ele.setAttribute('disabled',true)
        return this
     }
 
     //#endregion
 
     get Element()
     {
        return this.ele
     }
 }
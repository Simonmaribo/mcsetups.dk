// @ts-nocheck
import { useEffect } from 'react'
import SingletonRouter, { Router } from 'next/router'

const NavigationPrompt = ({ when, message }: { when: boolean, message: string }) => {
    useEffect(() => {
        SingletonRouter.router.change = (...args) => {
            if(!when) return Router.prototype.change.apply(SingletonRouter.router, args);
            return confirm(message)
                ? Router.prototype.change.apply(SingletonRouter.router, args)
                : new Promise((resolve, reject) => resolve(false));
        }

        window.onbeforeunload = function() {
            return when;
        };

        return () => {
            delete SingletonRouter.router.change,
            window.onbeforeunload = null;
        }
    }, [when, message])

    return null;
}

export default NavigationPrompt;
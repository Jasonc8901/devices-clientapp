import React from 'react'

export function getSelectOptions(choicePool) {
    return choicePool.map((option) => {
        return <option>{option}</option>
    })
}
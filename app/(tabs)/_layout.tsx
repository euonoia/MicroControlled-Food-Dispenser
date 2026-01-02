import {Tabs} from 'expo-router';

import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function _layout() {
  return (
    <Tabs>
        <Tabs.Screen
            name='index'
            options={{
                title: 'index'
            }}  
        />
    </Tabs>
  )
}

const styles = StyleSheet.create({})
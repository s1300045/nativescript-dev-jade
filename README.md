Pug support for NativeScript projects.
=======================================

How to use
----------
```
$ tns install pug
```

The above command installs this module and installs the necessary hooks. Pug processing of all `.pug` files inside `app` folder happens when the project is prepared for build.

Example:
```Pug
StackLayout
    Label(text="This is Label")
    Button(text="This is Button")
```

Result:
```XML
<StackLayout>
    <Label text="This is Label"></Label>
    <Button text="This is Button"></Button>
</StackLayout>
```

More info at https://pugjs.org.

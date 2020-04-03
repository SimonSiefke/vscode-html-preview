
import {
  createTestFile,
  activateExtension,
  setText,
} from '../../../../test-util'
import * as puppeteer from 'puppeteer'
import * as vscode from 'vscode'
import * as assert from 'assert'
import * as _ from 'lodash'

const headless = true

function getBrowser(){
	return puppeteer.launch({headless, args: ['--no-sandbox']})
}

let received = false 

function waitForUpdateStart(page){
	received = false
	page._client.on('Network.webSocketFrameReceived', ({requestId, timestamp, response}) => {
		received = true
	})
}
function waitForUpdateEnd(page){
	return new Promise((resolve, reject)=>{
		setTimeout(() => {
			reject(new Error('no update received'));
		}, 50);
		if(received){
			resolve()
		} else{
			page._client.on('Network.webSocketFrameReceived', ({requestId, timestamp, response}) => {
				resolve()
			})
		}
	})
}

function adjust(html) {
	return html.replace(/ data-id="\d*"/g, '');
}

test('issue22', async () => {
	const uri = await createTestFile('issue22.html')
  await setText(`<!DOCTYPE html>
<html>
  <head>
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <title>Page Title</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
  </head>
  <body>
    <table width="90%" cellspacing="0" cellpadding="0" border="1" style="border-collapse: collapse;">
      <tbody>
        <tr><td>1</td></tr>
        <tr><td>2</td></tr>
        <tr><td>3</td></tr>
        <tr><td>4</td></tr>
        <tr><td>5</td></tr>
        <tr><td>6</td></tr>
        <tr><td>7</td></tr>
        <tr><td>8</td></tr>
        <tr><td>9</td></tr>
        <tr><td>10</td></tr>
        <tr><td>11</td></tr>
        <tr><td>12</td></tr>
        <tr><td>13</td></tr>
        <tr><td>14</td></tr>
        <tr><td>15</td></tr>
        <tr><td>16</td></tr>
        <tr><td>17</td></tr>
        <tr><td>18</td></tr>
        <tr><td>19</td></tr>
        <tr><td>20</td></tr>
        <tr><td>21</td></tr>
        <tr><td>22</td></tr>
        <tr><td>23</td></tr>
        <tr><td>24</td></tr>
        <tr><td>25</td></tr>
        <tr><td>26</td></tr>
        <tr><td>27</td></tr>
        <tr><td>28</td></tr>
        <tr><td>29</td></tr>
        <tr><td>30</td></tr>
        <tr><td>31</td></tr>
        <tr><td>32</td></tr>
        <tr><td>33</td></tr>
        <tr><td>34</td></tr>
        <tr><td>35</td></tr>
        <tr><td>36</td></tr>
        <tr><td>37</td></tr>
        <tr><td>38</td></tr>
        <tr><td>39</td></tr>
        <tr><td>40</td></tr>
        <tr><td>41</td></tr>
        <tr><td>42</td></tr>
        <tr><td>43</td></tr>
        <tr><td>44</td></tr>
        <tr><td>45</td></tr>
        <tr><td>46</td></tr>
        <tr><td>47</td></tr>
        <tr><td>48</td></tr>
        <tr><td>49</td></tr>
        <tr><td>50</td></tr>
        <tr><td>51</td></tr>
        <tr><td>52</td></tr>
        <tr><td>53</td></tr>
        <tr><td>54</td></tr>
        <tr><td>55</td></tr>
        <tr><td>56</td></tr>
        <tr><td>57</td></tr>
        <tr><td>58</td></tr>
        <tr><td>59</td></tr>
        <tr><td>60</td></tr>
        <tr><td>61</td></tr>
        <tr><td>62</td></tr>
        <tr><td>63</td></tr>
        <tr><td>64</td></tr>
        <tr><td>65</td></tr>
        <tr><td>66</td></tr>
        <tr><td>67</td></tr>
        <tr><td>68</td></tr>
        <tr><td>69</td></tr>
        <tr><td>70</td></tr>
        <tr><td>71</td></tr>
        <tr><td>72</td></tr>
        <tr><td>73</td></tr>
        <tr><td>74</td></tr>
        <tr><td>75</td></tr>
        <tr><td>76</td></tr>
        <tr><td>77</td></tr>
        <tr><td>78</td></tr>
        <tr><td>79</td></tr>
        <tr><td>80</td></tr>
        <tr><td>81</td></tr>
        <tr><td>82</td></tr>
        <tr><td>83</td></tr>
        <tr><td>84</td></tr>
        <tr><td>85</td></tr>
        <tr><td>86</td></tr>
        <tr><td>87</td></tr>
        <tr><td>88</td></tr>
        <tr><td>89</td></tr>
        <tr><td>90</td></tr>
        <tr><td>91</td></tr>
        <tr><td>92</td></tr>
        <tr><td>93</td></tr>
        <tr><td>94</td></tr>
        <tr><td>95</td></tr>
        <tr><td>96</td></tr>
        <tr><td>97</td></tr>
        <tr><td>98</td></tr>
        <tr><td>99</td></tr>
        <tr><td>100</td></tr>
      </tbody>
    </table>
  </body>
</html>`)
  await activateExtension()
  const browser = await getBrowser()
  const page = await browser.newPage()
  await vscode.commands.executeCommand('htmlPreview.openPreview')
  await page.goto('http://localhost:3000/issue22.html', {waitUntil: 'networkidle2', timeout: 10000})
  //await page.goto('http://localhost:3000/issue22.html')
	
	{
    
    	const edit = {
  "rangeOffset": 3246,
  "rangeLength": 0,
  "text": "\n        <tr><td>101</td></tr>"
}
  const vscodeEdit = new vscode.WorkspaceEdit()
  const {document} = vscode.window.activeTextEditor
  vscodeEdit.replace(
    uri,
    new vscode.Range(
      document.positionAt(edit.rangeOffset),
      document.positionAt(edit.rangeOffset + edit.rangeLength)
    ),
    edit.text
  )
waitForUpdateStart(page)
await vscode.workspace.applyEdit(vscodeEdit)
await waitForUpdateEnd(page)
    
	const html = await page.content()
	assert.equal(adjust(html), `<!DOCTYPE html><html><head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Page Title</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <table width="90%" cellspacing="0" cellpadding="0" border="1" style="border-collapse: collapse;">
      <tbody>
        <tr><td>1</td></tr>
        <tr><td>2</td></tr>
        <tr><td>3</td></tr>
        <tr><td>4</td></tr>
        <tr><td>5</td></tr>
        <tr><td>6</td></tr>
        <tr><td>7</td></tr>
        <tr><td>8</td></tr>
        <tr><td>9</td></tr>
        <tr><td>10</td></tr>
        <tr><td>11</td></tr>
        <tr><td>12</td></tr>
        <tr><td>13</td></tr>
        <tr><td>14</td></tr>
        <tr><td>15</td></tr>
        <tr><td>16</td></tr>
        <tr><td>17</td></tr>
        <tr><td>18</td></tr>
        <tr><td>19</td></tr>
        <tr><td>20</td></tr>
        <tr><td>21</td></tr>
        <tr><td>22</td></tr>
        <tr><td>23</td></tr>
        <tr><td>24</td></tr>
        <tr><td>25</td></tr>
        <tr><td>26</td></tr>
        <tr><td>27</td></tr>
        <tr><td>28</td></tr>
        <tr><td>29</td></tr>
        <tr><td>30</td></tr>
        <tr><td>31</td></tr>
        <tr><td>32</td></tr>
        <tr><td>33</td></tr>
        <tr><td>34</td></tr>
        <tr><td>35</td></tr>
        <tr><td>36</td></tr>
        <tr><td>37</td></tr>
        <tr><td>38</td></tr>
        <tr><td>39</td></tr>
        <tr><td>40</td></tr>
        <tr><td>41</td></tr>
        <tr><td>42</td></tr>
        <tr><td>43</td></tr>
        <tr><td>44</td></tr>
        <tr><td>45</td></tr>
        <tr><td>46</td></tr>
        <tr><td>47</td></tr>
        <tr><td>48</td></tr>
        <tr><td>49</td></tr>
        <tr><td>50</td></tr>
        <tr><td>51</td></tr>
        <tr><td>52</td></tr>
        <tr><td>53</td></tr>
        <tr><td>54</td></tr>
        <tr><td>55</td></tr>
        <tr><td>56</td></tr>
        <tr><td>57</td></tr>
        <tr><td>58</td></tr>
        <tr><td>59</td></tr>
        <tr><td>60</td></tr>
        <tr><td>61</td></tr>
        <tr><td>62</td></tr>
        <tr><td>63</td></tr>
        <tr><td>64</td></tr>
        <tr><td>65</td></tr>
        <tr><td>66</td></tr>
        <tr><td>67</td></tr>
        <tr><td>68</td></tr>
        <tr><td>69</td></tr>
        <tr><td>70</td></tr>
        <tr><td>71</td></tr>
        <tr><td>72</td></tr>
        <tr><td>73</td></tr>
        <tr><td>74</td></tr>
        <tr><td>75</td></tr>
        <tr><td>76</td></tr>
        <tr><td>77</td></tr>
        <tr><td>78</td></tr>
        <tr><td>79</td></tr>
        <tr><td>80</td></tr>
        <tr><td>81</td></tr>
        <tr><td>82</td></tr>
        <tr><td>83</td></tr>
        <tr><td>84</td></tr>
        <tr><td>85</td></tr>
        <tr><td>86</td></tr>
        <tr><td>87</td></tr>
        <tr><td>88</td></tr>
        <tr><td>89</td></tr>
        <tr><td>90</td></tr>
        <tr><td>91</td></tr>
        <tr><td>92</td></tr>
        <tr><td>93</td></tr>
        <tr><td>94</td></tr>
        <tr><td>95</td></tr>
        <tr><td>96</td></tr>
        <tr><td>97</td></tr>
        <tr><td>98</td></tr>
        <tr><td>99</td></tr>
        <tr><td>100</td></tr>
        <tr><td>101</td></tr>
      </tbody>
    </table>
  
</body></html>`);
	
		}
	await browser.close()
	await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
})
